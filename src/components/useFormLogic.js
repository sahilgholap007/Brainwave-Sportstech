"use client";
import { useState, useEffect } from "react";
import { auth, db } from "@/firebase/firebaseconfig"; // Adjust the import path
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, updateDoc, arrayUnion, setDoc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { v4 as uuidv4 } from "uuid";

const storage = getStorage();

const useFormLogic = (defaultFormData, collectionName, folderName) => {
  const [formData, setFormData] = useState(defaultFormData);
  const [userId, setUserId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [totalPriceUSD, setTotalPriceUSD] = useState(601.4);
  const [convertedPrice, setConvertedPrice] = useState(0);
  const [currencySymbol, setCurrencySymbol] = useState("$");
  const [userCountry, setUserCountry] = useState("IN");

  // Authenticate and initialize user
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid);

        const userDocRef = doc(db, collectionName, user.uid);

        // Ensure Firestore document exists
        const userDoc = await getDoc(userDocRef);
        if (!userDoc.exists()) {
          await setDoc(userDocRef, { cart: [], processedOrders: [] });
        }
      } else {
        setUserId(null);
      }
    });

    return () => unsubscribe();
  }, [collectionName]);

  // Update price based on submission type
  useEffect(() => {
    const pricing = {
      New: 50000,
      Resubmission: 21000,
      Renewal: 12000,
    };
    setTotalPriceUSD(pricing[formData.submissionType] || 0);
  }, [formData.submissionType]);

  // Fetch user location and convert currency
  useEffect(() => {
    const fetchLocationAndRates = async () => {
      try {
        const locationResponse = await fetch("https://ipapi.co/json/");
        const locationData = await locationResponse.json();
        setUserCountry(locationData.country);

        const currencyCode = locationData.currency;
        const ratesResponse = await fetch(
          `https://api.exchangerate-api.com/v4/latest/INR`
        );
        const ratesData = await ratesResponse.json();

        const conversionRate = ratesData.rates[currencyCode];
        setConvertedPrice((totalPriceUSD * conversionRate).toFixed(2));
        setCurrencySymbol(
          new Intl.NumberFormat("en", { style: "currency", currency: currencyCode })
            .format(0)
            .charAt(0)
        );
      } catch (error) {
        console.error("Error fetching location or rates:", error);
        setConvertedPrice(totalPriceUSD);
      }
    };

    fetchLocationAndRates();
  }, [totalPriceUSD]);

  // Form change handler
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  // Image upload handler
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    setImagePreview(URL.createObjectURL(file));
    setFormData({ ...formData, image: file });
  };

  const uploadImageToStorage = async (file) => {
    const fileRef = ref(storage, `${folderName}/${userId}/${file.name}`);
    await uploadBytes(fileRef, file);
    return await getDownloadURL(fileRef);
  };

  // Submit form data
  const handleSubmit = async () => {
    if (!formData.termsAccepted) {
      alert("You must accept the terms and conditions.");
      return;
    }

    if (!userId) {
      alert("You must be logged in.");
      return;
    }

    setIsSubmitting(true);

    try {
      const uniqueId = uuidv4();
      let imageURL = "";

      if (formData.image) {
        imageURL = await uploadImageToStorage(formData.image);
      }

      const order = {
        id: uniqueId,
        ...formData,
        image: imageURL,
        totalPriceUSD,
        convertedPriceWithSymbol: `${currencySymbol}${convertedPrice}`,
        userCountry,
        timestamp: new Date().toISOString(),
      };

      const userDocRef = doc(db, collectionName, userId);
      await updateDoc(userDocRef, { processedOrders: arrayUnion(order) });

      alert("Form submitted successfully!");
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Failed to submit the form.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add item to cart
  const handleAddToCart = async () => {
    if (!userId) {
      alert("You must be logged in.");
      return;
    }

    try {
      const uniqueId = uuidv4();
      let imageURL = "";

      if (formData.image) {
        imageURL = await uploadImageToStorage(formData.image);
      }

      const cartItem = {
        id: uniqueId,
        ...formData,
        image: imageURL,
        totalPriceUSD,
        convertedPriceWithSymbol: `${currencySymbol}${convertedPrice}`,
        timestamp: new Date().toISOString(),
      };

      const userDocRef = doc(db, collectionName, userId);
      await updateDoc(userDocRef, { cart: arrayUnion(cartItem) });

      alert("Item added to cart!");
    } catch (error) {
      console.error("Error adding to cart:", error);
      alert("Failed to add to cart.");
    }
  };

  return {
    formData,
    imagePreview,
    isSubmitting,
    convertedPrice,
    currencySymbol,
    handleChange,
    handleImageUpload,
    handleSubmit,
    handleAddToCart,
  };
};

export default useFormLogic;
