function PageContainer({ children, className = '' }) {
  return (
    <main
      className={[
        'mx-auto w-full max-w-[1600px]',
        'px-5 py-4',
        'sm:px-6 sm:py-8',
        'lg:px-8',
        className,
      ].join(' ')}
    >
      {children}
    </main>
  )
}

export default PageContainer
