import React from 'react'
import userImg from '../../assets/user.png';
import './Avatar.scss';

function Avatar({src}) {
  return (
    <div className='Avatar'>
        <img src={src?src:userImg} alt="Avatar" />
    </div>
  )
}

export default Avatar