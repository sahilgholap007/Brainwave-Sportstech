'use client';
import React, { createContext, useContext, useState, useCallback } from 'react';
import { getStorage, ref, deleteObject } from 'firebase/storage';
import { doc, getDoc, updateDoc, setDoc, arrayRemove, arrayUnion } from 'firebase/firestore';
import { db, auth } from '@/firebase/firebaseconfig';

const CartContext = createContext();
const storage = getStorage();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  // Fetch cart items from Firestore
  const fetchCartItems = useCallback(async (userId) => {
    try {
      if (!userId) {
        console.error('User ID is required to fetch cart items.');
        return;
      }

      const userDocRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const data = userDoc.data();
        const { cart = [] } = data;
        setCart(cart);

        // Self-heal logic for legacy users
        const currentUser = auth?.currentUser;
        if (currentUser && (!data.email || !data.role)) {
          setDoc(userDocRef, {
            uid: userId,
            email: data.email || currentUser.email || "",
            displayName: data.displayName || currentUser.displayName || (currentUser.email ? currentUser.email.split('@')[0] : "User"),
            role: data.role || "user",
            createdAt: data.createdAt || new Date(),
            lastActive: new Date()
          }, { merge: true }).catch(err => console.error("Error healing user doc:", err));
        } else {
          // Just update lastActive
          setDoc(userDocRef, {
            uid: userId,
            lastActive: new Date(),
          }, { merge: true }).catch(err => console.error("Error syncing user doc:", err));
        }

      } else {
        setCart([]);
        // Create initial document for brand new users hitting the cart without signup
        const currentUser = auth?.currentUser;
        setDoc(userDocRef, {
          uid: userId,
          email: currentUser?.email || "",
          displayName: currentUser?.displayName || (currentUser?.email ? currentUser.email.split('@')[0] : "User"),
          role: "user",
          createdAt: new Date(),
          lastActive: new Date(),
          cart: []
        }, { merge: true }).catch(err => console.error("Error creating user doc:", err));
      }

    } catch (error) {
      console.error('Error fetching cart items:', error);
    }
  }, []);


  // Add an item to the cart
  const addToCart = useCallback(async (userId, item) => {
    try {
      if (!userId || !item) {
        console.error('User ID and item are required to add to cart.');
        return;
      }

      const userDocRef = doc(db, 'users', userId);

      // Use setDoc with merge: true to ensure the user document exists and update the cart array
      await setDoc(userDocRef, {
        cart: arrayUnion(item),
      }, { merge: true });

      // Update local state
      setCart((prevCart) => [...prevCart, item]);

    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  }, []);

  const removeFromCart = useCallback(async (userId, itemId) => {
    try {
      if (!userId || !itemId) {
        console.error("User ID and item ID are required to remove from cart.");
        return false;
      }

      const userDocRef = doc(db, 'users', userId);

      // Check if the user document exists
      const userDoc = await getDoc(userDocRef);
      if (!userDoc.exists()) {
        console.warn(`No document found for user: ${userId} in 'users' collection.`);
        return false;
      }

      const { cart = [] } = userDoc.data();
      const itemToRemove = cart.find((item) => item.id === itemId);

      if (itemToRemove) {
        // Remove associated image(s) from Firebase Storage
        if (itemToRemove.courtImages && Array.isArray(itemToRemove.courtImages)) {
          for (const img of itemToRemove.courtImages) {
            if (img.url) {
              try {
                const imageRef = ref(storage, img.url);
                await deleteObject(imageRef);
              } catch (e) { console.warn("Failed to delete court image", e); }
            }
          }
        } else {
          const imageURL = itemToRemove.paddleImage || itemToRemove.ballImage;
          if (imageURL) {
            try {
              const imageRef = ref(storage, imageURL);
              await deleteObject(imageRef);
            } catch (e) { console.warn("Failed to delete image", e); }
          }
        }


        // Update Firestore with the filtered array (More reliable than arrayRemove for objects)
        const updatedFirestoreCart = cart.filter((item) => item.id !== itemId);

        await updateDoc(userDocRef, {
          cart: updatedFirestoreCart,
        });

        // Update local state
        setCart(updatedFirestoreCart);


        return true; // Indicate success
      } else {
        console.warn(`Item with ID ${itemId} not found in cart.`);
        return false; // Indicate failure
      }
    } catch (error) {
      console.error("Error removing item from cart:", error);
      throw error;
    }
  }, []);



  // Clear the cart
  const clearCart = useCallback(async (userId) => {
    try {
      if (!userId) {
        console.error('User ID is required to clear the cart.');
        return;
      }

      const userDocRef = doc(db, 'users', userId);

      // Fetch user's cart
      const userDoc = await getDoc(userDocRef);
      if (!userDoc.exists()) {
        console.warn(`No document found for user: ${userId} in 'users' collection.`);
        setCart([]); // Clear local state even if no doc exists
        return;
      }

      const { cart = [] } = userDoc.data();

      // Delete associated images from Firebase Storage
      const imageDeletes = cart.map(async (item) => {
        // Handle array images (Court)
        if (item.courtImages && Array.isArray(item.courtImages)) {
          for (const img of item.courtImages) {
            if (img.url) {
              try {
                const imageRef = ref(storage, img.url);
                await deleteObject(imageRef);
              } catch (e) { /* console.warn("Failed to delete court image", e); */ }
            }
          }
        } else {
          // Handle single images
          const imageURL = item.paddleImage || item.ballImage;
          if (imageURL) {
            try {
              const imageRef = ref(storage, imageURL);
              await deleteObject(imageRef);
            } catch (e) { /* console.warn("Failed to delete image", e); */ }
          }
        }
      });

      // Wait for all image deletions to complete
      await Promise.all(imageDeletes);

      // Clear cart in Firestore
      await updateDoc(userDocRef, {
        cart: [],
      });

      // Clear local state
      setCart([]);

    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  }, []);

  return (
    <CartContext.Provider
      value={{ cart, addToCart, removeFromCart, clearCart, fetchCartItems }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  return useContext(CartContext);
};
