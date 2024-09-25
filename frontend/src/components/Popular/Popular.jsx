import React, { useEffect, useState } from 'react'
import './Popular.css'
import Item from '../Item/Item'
const url = 'http://localhost:4000'
const Popular = () => {

  const [popularProducts, setPopular_product]= useState([]);

  useEffect(()=>{
    fetch(`${url}/popularinwomen`)
    .then((response)=>response.json())
    .then((data)=>setPopular_product(data))
  },[])

  return (
    <div className='popular'>
        <h1>POPULAR IN WOMEN</h1>
        <hr />
        <div className="popular-item">
            {popularProducts.map((item,i)=>{
                return <Item key={i} id={item.id} name ={item.name} image={item.image} new_price={item.new_price} old_price={item.old_price}/>
            })}
        </div>
    </div>
  )
}

export default Popular
