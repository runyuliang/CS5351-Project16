// 非必要：简单封装当前登录状态
import { useState } from 'react'

export function useUser(){
  const [user, setUser] = useState(null)
  return {user, setUser}
}