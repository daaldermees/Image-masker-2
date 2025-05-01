import { Outlet, Link, useLocation } from 'react-router-dom'
import logoSrc from '../assets/GT_Logo.svg'

const Layout = () => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;
  
  return (
    <>
      <nav className="sidebar">
        <div className="company-logo">
          <img src={logoSrc} alt="Game Tailors Logo" />
        </div>

        <div className="sidebar-section">
          <ul className="sidebar-links">
            <li className={isActive('/') ? 'active' : ''}>
              <Link to="/">Home</Link>
            </li>
          </ul>
        </div>

        <div className="sidebar-section">
          <div className="section-title">Tools</div>
          <ul className="sidebar-links">
            <li className={isActive('/image-masker') ? 'active' : ''}>
              <Link to="/image-masker">Image Masker</Link>
            </li>
            <li className={isActive('/quote-generator') ? 'active' : ''}>
              <Link to="/quote-generator">Quote Generator</Link>
            </li>
            <li className={isActive('/email-signature') ? 'active' : ''}>
              <Link to="/email-signature">Email Signature</Link>
            </li>
          </ul>
        </div>
      </nav>

      <main>
        <Outlet />
      </main>
    </>
  )
}

export default Layout 