import React from 'react'
import { DisplayPriceInRupees } from '../utils/DisplayPriceInRupees'
import { Link } from 'react-router-dom'
import { valideURLConvert } from '../utils/valideURLConvert'
import { pricewithDiscount } from '../utils/PriceWithDiscount'
import { useState } from 'react'
import AddToCartButton from './AddToCartButton'

const CardProduct = ({data}) => {
    const url = `/product/${valideURLConvert(data.name)}-${data._id}`
    const [loading,setLoading] = useState(false)
  
  return (
    <Link to={url} className='relative bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col min-w-36 lg:min-w-52 group' >
      {/* Discount badge */}
      {Boolean(data.discount) && (
        <div className='absolute top-2 left-2 z-10 bg-red-500 text-white text-xs font-bold py-1 px-2 rounded-full'>
          {data.discount}% OFF
        </div>
      )}
      
      {/* Image container with hover effect */}
      <div className='relative min-h-32 lg:min-h-48 w-full bg-gray-50 flex items-center justify-center p-2'>
        <img 
          src={data.image[0]}
          alt={data.name}
          className='w-full h-full object-contain transition-transform duration-300 group-hover:scale-110'
        />
      </div>
      
      {/* Content area */}
      <div className='flex flex-col p-3 gap-2 flex-grow'>
        {/* Delivery time */}
        <div className='flex items-center gap-1'>
          <div className='flex items-center gap-1 rounded text-xs p-1 px-2 text-green-600 bg-green-50'>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
            10 min 
          </div>
        </div>
        
        {/* Product name */}
        <h3 className='font-medium text-gray-800 text-sm lg:text-base line-clamp-2'>
          {data.name}
        </h3>
        
        {/* Unit */}
        <div className='text-xs text-gray-500 flex items-center'>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
          </svg>
          {data.unit}
        </div>
        
        {/* Price and add to cart section */}
        <div className='flex items-center justify-between mt-auto pt-2 border-t border-gray-100'>
          <div className='flex flex-col'>
            <span className='font-bold text-gray-900'>
              {DisplayPriceInRupees(pricewithDiscount(data.price,data.discount))}
            </span>
            
            {/* Original price if discounted */}
            {Boolean(data.discount) && (
              <span className='text-xs text-gray-400 line-through'>
                {DisplayPriceInRupees(data.price)}
              </span>
            )}
          </div>
          
          {/* Stock status or Add to cart button */}
          <div>
            {data.stock == 0 ? (
              <div className='flex items-center text-red-500 text-xs bg-red-50 px-2 py-1 rounded'>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Out of stock
              </div>
            ) : (
              <AddToCartButton data={data} />
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}

export default CardProduct