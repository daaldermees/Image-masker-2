import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import ImageMasker from './pages/ImageMasker'
import QuoteGenerator from './pages/QuoteGenerator'
import EmailSignature from './pages/EmailSignature'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="image-masker" element={<ImageMasker />} />
        <Route path="quote-generator" element={<QuoteGenerator />} />
        <Route path="email-signature" element={<EmailSignature />} />
      </Route>
    </Routes>
  )
}

export default App 