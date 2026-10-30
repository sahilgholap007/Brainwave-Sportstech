import React from 'react';
import { Carousel } from 'react-responsive-carousel';
import Image from 'next/image';
import 'react-responsive-carousel/lib/styles/carousel.min.css';

const ImageCarousel = ({ images }) => {

  return (
    <div className="w-full max-w-[800px] h-[300px] md:h-[500px] relative shadow-lg rounded-lg overflow-hidden">
      <Carousel
        showArrows={true}
        showStatus={false}
        showThumbs={true}
        showIndicators={false}
        infiniteLoop={true}
        autoPlay={true}
        interval={2000}
        stopOnHover={true}
        renderArrowPrev={(onClickHandler, hasPrev, label) =>
          hasPrev && (
            <button
              type="button"
              onClick={onClickHandler}
              title={label}
              className="absolute z-10 left-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 md:p-3 rounded-full border-none cursor-pointer text-sm md:text-lg"
            >
              &lt;
            </button>
          )
        }
        renderArrowNext={(onClickHandler, hasNext, label) =>
          hasNext && (
            <button
              type="button"
              onClick={onClickHandler}
              title={label}
              className="absolute z-10 right-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 md:p-3 rounded-full border-none cursor-pointer text-sm md:text-lg"
            >
              &gt;
            </button>
          )
        }
        renderThumbs={(children) =>
          children.map((item, index) => (
            <div
              key={index}
              className="w-12 h-12 md:w-16 md:h-16 rounded-full overflow-hidden opacity-50 hover:opacity-100 transition-opacity duration-300"
            >
              <Image
                src={images[index].src}
                alt={images[index].alt}
                layout="fill"
                objectFit="cover"
              />
            </div>
          ))
        }
      >
        {images.map((image, index) => (
          <div key={index} className="w-full h-[300px] md:h-[500px]">
            <Image
              src={image.src}
              alt={image.alt}
              layout="fill"
              objectFit="cover"
            />
          </div>
        ))}
      </Carousel>
    </div>
  );
};

export default ImageCarousel;
