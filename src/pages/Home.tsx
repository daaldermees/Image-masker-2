import { Link } from 'react-router-dom'

const Home = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold text-primary mb-8">Game Tailors brand tools</h1>
      
      <div className="home-cards">
        <Link
          to="/image-masker"
          className="home-card"
          style={{ backgroundColor: '#e8f3fa' }}
        >
          <svg className="home-card-icon" viewBox="0 0 24 24" fill="none" stroke="var(--blue)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M8 12.5a5 5 0 1 0 8 0 5 5 0 0 0-8 0"></path>
            <path d="M8 12.5a5 5 0 0 1 8 0"></path>
          </svg>
          <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--blue)' }}>Image Masker</h2>
          <p className="text-gray-600 mb-4">
            Create custom image masks with different shapes and backgrounds. Perfect for profile pictures and avatars.
          </p>
          <div className="home-card-link" style={{ color: 'var(--blue)' }}>
            <span>Try it now</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14"></path>
              <path d="M12 5l7 7-7 7"></path>
            </svg>
          </div>
        </Link>

        <Link
          to="/quote-generator"
          className="home-card"
          style={{ backgroundColor: '#eef9f2' }}
        >
          <svg className="home-card-icon" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"></path>
            <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"></path>
          </svg>
          <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--green)' }}>Quote Generator</h2>
          <p className="text-gray-600 mb-4">
            Generate beautiful quote images with custom styling, colors, and author information.
          </p>
          <div className="home-card-link" style={{ color: 'var(--green)' }}>
            <span>Try it now</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14"></path>
              <path d="M12 5l7 7-7 7"></path>
            </svg>
          </div>
        </Link>
        
        <Link
          to="/email-signature"
          className="home-card"
          style={{ backgroundColor: '#fdf0f0' }}
        >
          <svg className="home-card-icon" viewBox="0 0 24 24" fill="none" stroke="var(--red)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="4" width="20" height="16" rx="2"></rect>
            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
          </svg>
          <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--red)' }}>Email Signature</h2>
          <p className="text-gray-600 mb-4">
            Create professional email signatures with your branding, contact information and social links.
          </p>
          <div className="home-card-link" style={{ color: 'var(--red)' }}>
            <span>Try it now</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14"></path>
              <path d="M12 5l7 7-7 7"></path>
            </svg>
          </div>
        </Link>
      </div>
    </div>
  )
}

export default Home 