import React from 'react'

const PageHeader = ({ title, description, backgroundImage }) => {
    return (
        <header
            className='relative grid h-60 place-items-center text-center'
            style={{
                backgroundImage: `url(${backgroundImage})`,
                backgroundPosition: 'center',
                backgroundSize: 'cover',
            }}
        >
            <div className='absolute inset-0 bg-black/75 transition-all duration-300' />
            <div className='container relative z-10 text-white'>
                <h1 className='text-3xl font-bold md:text-4xl'>{title}</h1>
                {description && (
                    <p className='mx-auto mt-2 max-w-xl text-sm font-medium md:text-base'>
                        {description}
                    </p>
                )}
            </div>
        </header>
    )
}

export default PageHeader
