/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable  @typescript-eslint/no-explicit-any */
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function PromptInput() {
  const [prompt, setPrompt] = useState('')
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [response, setResponse] = useState(null)

  const handleSubmit = async () => {
    if (prompt.trim()) {
      try {
        setLoading(true)
        setError(null)
        const encodedPrompt = encodeURIComponent(prompt.trim())
        router.push(`/editor?prompt=${encodedPrompt}`)
        // Prepare the request body
        // const requestData = { Prompt: prompt.trim() }

   
        // const response = await fetch('http://localhost:3001/generate', {
        //   method: 'POST',
        //   headers: {
        //     'Content-Type': 'application/json',
        //   },
        //   body: JSON.stringify(requestData),
        // })        


        // if (!response.ok) {
        //   throw new Error('Failed to send request to API')
        // }
        // const data = await response.json()
        // setResponse(data)  // Handle the response from API

        // console.log('Response from API:', data)
      } catch (error:any) {
        setError(error.message)
        console.error('Error:', error)
      } finally {
        setLoading(false)
      }
    }
   setPrompt('');
  }

  
  return (
    <div className="relative group">
      <textarea
        className="font-orbitron  font-normal w-full h-32 bg-[#111] rounded-lg px-4 py-3 text-sm resize-none border border-gray-800 focus:border-gray-700 focus:outline-none input-glow"
        placeholder="What do you want to generate?"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
      />
      <button
        onClick={handleSubmit}
        // onClick={fetchBackendData}
        className="font-orbitron text-lg font-normal mt-4 w-full bg-customRed text-stone-400 hover:text-white  py-2 rounded-lg hover:bg-customRed1 transition-colors"
      >
        Submit
      </button>
    </div>
  )
}

