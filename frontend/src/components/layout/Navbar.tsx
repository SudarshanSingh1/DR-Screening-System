import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const navigate = useNavigate();

  const navItems = [
    { name: 'Home', href: '#home' },
    { name: 'Disease Stages', href: '#disease-stages' },
    { name: 'Screening Workflow', href: '#workflow-diagram' }
  ];

  // Handle scroll effects
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);

      // Determine active section based on scroll position
      const sections = ['home', 'disease-stages', 'workflow-diagram'];
      const current = sections.find(section => {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          // If the top of the section is near the top of the viewport
          return rect.top >= -100 && rect.top <= 300;
        }
        return false;
      });

      if (current) {
        setActiveSection(current);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    
    const targetId = href.replace('#', '');
    const element = document.getElementById(targetId);
    
    if (element) {
      // Offset for sticky navbar height (~80px)
      const offset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
      setActiveSection(targetId);
    }
  };

  return (
    <nav 
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-200 py-3' 
          : 'bg-white py-4'
      }`}
    >
      <div className="mx-auto max-w-[1400px] px-6 lg:px-8">
        <div className="flex items-center justify-between">
          
          {/* LOGO & BRAND */}
          <div className="flex items-center gap-3">
            <a href="#home" onClick={(e) => handleNavClick(e, '#home')} className="flex items-center gap-3 group focus:outline-none focus:ring-2 focus:ring-[#2663eb] rounded">
              <img 
                src="/VisionAi.png" 
                alt="Vision AI Platform" 
                className="h-8 w-auto object-contain transition-transform group-hover:scale-105"
              />
              <span className="hidden sm:block text-navy font-extrabold tracking-tight text-lg">
                VISION AI <span className="text-gray-400 font-medium">PLATFORM</span>
              </span>
            </a>
          </div>

          {/* DESKTOP NAVIGATION */}
          <div className="hidden lg:flex items-center gap-8">
            <ul className="flex items-center gap-8">
              {navItems.map((item) => (
                <li key={item.name}>
                  <a 
                    href={item.href}
                    onClick={(e) => handleNavClick(e, item.href)}
                    className={`text-sm font-bold uppercase tracking-widest transition-colors focus:outline-none focus:ring-2 focus:ring-[#2663eb] rounded px-2 py-1 ${
                      activeSection === item.href.replace('#', '')
                        ? 'text-[#2663eb]'
                        : 'text-gray-500 hover:text-[#2663eb]'
                    }`}
                  >
                    {item.name}
                  </a>
                </li>
              ))}
            </ul>
            
            <div className="h-6 w-px bg-gray-300"></div>

            <button onClick={() => navigate('/login')} className="bg-[#2663eb] hover:bg-[#1d4ed8] text-white px-6 py-2.5 rounded text-xs font-extrabold transition-colors shadow-sm tracking-widest uppercase focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2663eb]">
              Open Platform
            </button>
          </div>

          {/* MOBILE MENU TOGGLE */}
          <div className="lg:hidden flex items-center">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-navy p-2 focus:outline-none focus:ring-2 focus:ring-[#2663eb] rounded"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE MENU DROPDOWN */}
      {mobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 w-full bg-white border-b border-gray-200 shadow-lg px-6 py-4 flex flex-col gap-4">
          <ul className="flex flex-col gap-4">
            {navItems.map((item) => (
              <li key={item.name}>
                <a 
                  href={item.href}
                  onClick={(e) => handleNavClick(e, item.href)}
                  className={`block text-sm font-bold uppercase tracking-widest transition-colors focus:outline-none focus:ring-2 focus:ring-[#2663eb] rounded py-2 ${
                    activeSection === item.href.replace('#', '')
                      ? 'text-[#2663eb]'
                      : 'text-gray-600 hover:text-[#2663eb]'
                  }`}
                >
                  {item.name}
                </a>
              </li>
            ))}
          </ul>
          <hr className="border-gray-100" />
          <button onClick={() => navigate('/login')} className="bg-[#2663eb] hover:bg-[#1d4ed8] text-white w-full px-6 py-3 rounded text-xs font-extrabold transition-colors shadow-sm tracking-widest uppercase focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2663eb]">
            Open Platform
          </button>
        </div>
      )}
    </nav>
  );
}
