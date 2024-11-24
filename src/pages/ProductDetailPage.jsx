import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import Spinner from '../components/Spinner';
import left from '../assets/images/left.svg';
import right from '../assets/images/right.svg';
import cart from '../assets/images/cart.svg';

const ProductDetailPage = () => {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const { addToCart } = useCart();
  const [notification, setNotification] = useState('');

  useEffect(() => {
    fetch('/products.json')
      .then(response => response.json())
      .then(data => {
        const foundProduct = data.find(item => item.id.toString() === productId);
        setProduct(foundProduct);
      })
      .catch(error => console.error('Error fetching product:', error));
  }, [productId]);

  if (!product) {
    return <Spinner />;
  }

  const handleThumbnailClick = (index) => {
    setSelectedImage(index);
  };

  const handlePrevClick = () => {
    setSelectedImage((prevIndex) => (prevIndex === 0 ? product.images.length - 1 : prevIndex - 1));
  };

  const handleNextClick = () => {
    setSelectedImage((prevIndex) => (prevIndex === product.images.length - 1 ? 0 : prevIndex + 1));
  };

  const handleAddToCart = (product) => {
    addToCart(product);

    // Send a notification to Telegram
    const chatId = '471302375';
    const botToken = 'bot6363979388:AAGBxYYACvfpK0sbWI7mK8RhmdpM7QbmkCQ';
    const message = `A new product has been added to the cart! Product ID: ${product.id}, Product Name: ${product.name}`;

    fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message
      })
    })
    .then(response => response.json())
    .then(data => {
      if (data.ok) {
        setNotification('Message sent successfully!');
      } else {
        setNotification('Failed to send message.');
      }
    })
    .catch((error) => {
      console.error('Error:', error);
      setNotification('Error sending message.');
    });
  };

  return (
    <div className="product-detail">
      <div className="slider">
        <div className="main-image">
          <img src={product.images[selectedImage]} alt={`${product.name} ${selectedImage + 1}`} />
        </div>
        <div className="thumbnails">
          <button className="nav-button prev" onClick={handlePrevClick}><img src={left} alt="" /></button>
          {product.images.map((image, index) => (
            <img
              key={index}
              src={image}
              alt={`${product.name} thumbnail ${index + 1}`}
              className={selectedImage === index ? 'active' : ''}
              onClick={() => handleThumbnailClick(index)}
            />
          ))}
          <button className="nav-button next" onClick={handleNextClick}><img src={right} alt="" /></button>
        </div>
      </div>

      <div className="text">
        <h1>{product.name}</h1>
        <p>Price: ${product.price}</p>
        <p>Summary: {product.summary}</p>
        <p>Category: {product.category}</p>
        <p>Stock: {product.stock}</p>
        <p>Tags: {product.tags}</p>
        <p>Description: {product.description}</p>
        <button onClick={() => handleAddToCart(product)} className='btn-cart'>Add to Cart <div className="cart"><img src={cart} alt="" /></div></button>
        {notification && <p>{notification}</p>}
      </div>
    </div>
  );
};

export default ProductDetailPage;
