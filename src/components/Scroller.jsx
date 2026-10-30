'use client'
import React, { useEffect, useRef } from 'react';
import Image from 'next/image';
import styles from './Scroller.module.css';

const Scroller = ({ items, speed = 'fast', direction = 'left' }) => {
  const scrollerRef = useRef(null);

  useEffect(() => {
    const scroller = scrollerRef.current;

    // Check if user prefers reduced motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    if (scroller) {
      const scrollerInner = scroller.querySelector(`.${styles.scrollerInner}`);
      const scrollerContent = Array.from(scrollerInner.children);

      // Clone each item and append to create an infinite scrolling effect
      scrollerContent.forEach((item) => {
        const duplicatedItem = item.cloneNode(true);
        duplicatedItem.setAttribute('aria-hidden', 'true');
        scrollerInner.appendChild(duplicatedItem);
      });

      scroller.setAttribute('data-animated', 'true');
    }
  }, []);

  return (
    <div
      className={`${styles.scroller} `}
      data-speed={speed}
      data-direction={direction}
      ref={scrollerRef}
    >
      <ul className={`${styles.scrollerInner}`}>
        {items.map((item, index) => {
            return (
              <li  key={index} className={`${styles.scrollerItem}  `}>
                <Image
                  src={item.src}
                  alt={item.alt || 'Scroller Image'}
                  width={item.width || 150}
                  height={item.height || 150}
                  unoptimized
                  blurDataURL={item.blurDataURL || ''}
                  placeholder={item.blurDataURL ? 'blur' : 'empty'}
                  
                />
              </li>
            );
          }
        )}
      </ul>
    </div>
  );
};

export default Scroller;
