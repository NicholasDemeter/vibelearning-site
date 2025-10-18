import { Button } from "@/components/ui/button";
import { Menu, X, Settings, Home, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import vibeLogo from "@/assets/vibe-logo-1.png";
import houseOfVibeLogo from "@/assets/house-of-vibe-logo.png";
import { useCopy } from "@/hooks/useCopy";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { getString } = useCopy();
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { name: getString("nav.products", "Products"), href: "#products", page: false },
    { name: getString("nav.philosophy", "Philosophy"), href: "#philosophy", page: false }, 
    { name: getString("nav.innovation", "Innovation"), href: "#innovation", page: false },
    { name: getString("nav.community", "Community"), href: "/community", page: true }
  ];

  const handleNavClick = (href: string, isPage: boolean) => {
    if (isPage) {
      // Navigate to dedicated page
      navigate(href);
    } else if (location.pathname === '/') {
      // On homepage, scroll to section
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      // On other pages, navigate to homepage then scroll
      navigate('/');
      setTimeout(() => {
        const element = document.querySelector(href);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
    setIsOpen(false);
  };

  const handleBackClick = () => {
    window.history.back();
  };

  const handleHomeClick = () => {
    navigate('/');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gradient-glass backdrop-blur-md border-b border-border/50">
      <div className="container">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex items-center">
            <img 
              src={vibeLogo} 
              alt="Vibe Learning" 
              className="h-24 w-auto opacity-70"
            />
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center justify-center flex-1 gap-4 lg:gap-8">
            {location.pathname !== '/' && (
              <>
                <Button variant="ghost" size="sm" onClick={handleBackClick} className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
                <Button variant="ghost" size="sm" onClick={handleHomeClick} className="flex items-center gap-2">
                  <Home className="h-4 w-4" />
                  Home
                </Button>
              </>
            )}
            {menuItems.map((item) => (
              <button
                key={item.name}
                onClick={() => handleNavClick(item.href, item.page)}
                className="text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap"
              >
                {item.name}
              </button>
            ))}
          </div>

          {/* Right Side Items */}
          <div className="hidden md:flex items-center gap-3 lg:gap-4">
            <Link to="/admin">
              <Button variant="outline" size="sm" className="flex items-center gap-2 whitespace-nowrap">
                <Settings className="w-4 h-4" />
                {getString("nav.admin", "Admin")}
              </Button>
            </Link>
            <a 
              href="https://www.houseofvibe.org" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center opacity-70 hover:opacity-100 transition-opacity flex-shrink-0"
              title={getString("nav.houseOfVibe", "House of Vibe")}
            >
              <img 
                src={houseOfVibeLogo} 
                alt="House of Vibe" 
                className="h-16 w-16 object-contain"
              />
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-border/50">
            <div className="flex flex-col space-y-4">
              {location.pathname !== '/' && (
                <div className="flex gap-2 pb-2 border-b border-border/50">
                  <Button variant="ghost" size="sm" onClick={handleBackClick} className="flex items-center gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Back
                  </Button>
                  <Button variant="ghost" size="sm" onClick={handleHomeClick} className="flex items-center gap-2">
                    <Home className="h-4 w-4" />
                    Home
                  </Button>
                </div>
              )}
              {menuItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => handleNavClick(item.href, item.page)}
                  className="text-muted-foreground hover:text-foreground transition-colors py-2 text-left"
                >
                  {item.name}
                </button>
              ))}
              <Link to="/admin" onClick={() => setIsOpen(false)}>
                <Button variant="outline" size="sm" className="flex items-center gap-2 self-start">
                  <Settings className="w-4 h-4" />
                  {getString("nav.admin", "Admin")}
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;