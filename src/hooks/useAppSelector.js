import { useSelector } from 'react-redux'

const useAppSelector = (selector, equalityFn) => {
  return useSelector(selector, equalityFn)
}

export default useAppSelector
