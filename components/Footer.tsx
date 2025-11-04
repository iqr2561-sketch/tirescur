import React from 'react';
import { Link } from 'react-router-dom';
import { FooterContent, MenuItem } from '../types';

interface FooterProps {
  footerContent: FooterContent;
  footerInfoMenus: MenuItem[]; // New prop for dynamic info links
  footerAccountMenus: MenuItem[]; // New prop for dynamic account links
}

const Footer: React.FC<FooterProps> = ({ footerContent, footerInfoMenus, footerAccountMenus }) => {
  const renderLink = (item: MenuItem) => {
    if (item.isExternal) {
      return (
        <a href={item.path} target="_blank" rel="noopener noreferrer" className="hover:text-red-600 transition-colors">
          {item.name}
        </a>
      );
    }
    return (
      <Link to={item.path} className="hover:text-red-600 transition-colors">
        {item.name}
      </Link>
    );
  };

  return (
    <footer className="bg-gray-900 text-gray-400 py-12">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* About Us */}
        <div>
          <h3 className="text-white text-lg font-semibold mb-4">Sobre Nosotros</h3>
          <p className="text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: (footerContent?.aboutUsText || '').replace(/\n/g, '<br/>') }}>
          </p>
          <div className="flex space-x-4 mt-4">
            {footerContent.socialMedia?.facebook && (
              <a href={footerContent.socialMedia.facebook} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-red-600 transition-colors" aria-label="Facebook">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .732.593 1.324 1.325 1.324h11.493v-9.294h-3.13v-3.627h3.13v-2.19c0-3.102 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.627l-.474 3.627h-3.153v9.293h6.116c.732 0 1.325-.593 1.325-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z"/></svg>
              </a>
            )}
            {footerContent.socialMedia?.instagram && (
              <a href={footerContent.socialMedia.instagram} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-red-600 transition-colors" aria-label="Instagram">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.772 1.667 4.923 4.923.058 1.265.07 1.645.07 4.85s-.012 3.585-.07 4.85c-.15 3.256-1.668 4.773-4.923 4.923-1.265.058-1.644.07-4.85.07s-3.585-.012-4.85-.07c-3.255-.15-4.773-1.667-4.923-4.923-.058-1.265-.07-1.644-.07-4.85s.012 3.585.07 4.85c.15-3.256 1.668-4.772 4.923-4.923 1.266-.058 1.644-.07 4.85-.07zm0 2.163c-3.203 0-3.584.012-4.849.07-2.903.132-3.96 1.134-4.092 4.092-.058 1.265-.07 1.644-.07 4.85s.012 3.585.07 4.85c.132 2.903 1.134 3.96 4.092 4.092 1.265.058 1.644.07 4.85.07s3.585-.012 4.85-.07c2.903-.132 3.96-1.134 4.092-4.092.058-1.265.07-1.644.07-4.85s-.012-3.585-.07-4.85c-.132-2.903-1.134-3.96-4.092-4.092-1.265-.058-1.644-.07-4.85-.07zm0 3.627c-2.28 0-4.133 1.854-4.133 4.133s1.854 4.133 4.133 4.133 4.133-1.854 4.133-4.133-1.853-4.133-4.133-4.133zm0 2.163c1.161 0 1.977.816 1.977 1.977s-.816 1.977-1.977 1.977-1.977-.816-1.977-1.977.816-1.977 1.977-1.977zm6.406-7.147c-.779 0-1.26.481-1.26 1.26s.481 1.26 1.26 1.26 1.26-.481 1.26-1.26-.481-1.26-1.26-1.26z"/></svg>
              </a>
            )}
            {footerContent.socialMedia?.twitter && (
              <a href={footerContent.socialMedia.twitter} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-red-600 transition-colors" aria-label="Twitter">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.351 0-6.07 2.719-6.07 6.071 0 .475.052.937.138 1.382-5.043-.252-9.513-2.668-12.503-6.315-.523.896-.822 1.943-.822 3.08 0 2.107 1.074 3.96 2.707 5.062-.997-.029-1.934-.303-2.752-.713v.079c0 2.953 2.097 5.416 4.881 5.993-.462.129-.96.195-1.473.195-.36 0-.71-.035-1.053-.102.773 2.427 3.004 4.162 5.64 4.201-2.083 1.625-4.723 2.593-7.59 2.593-.493 0-.978-.028-1.451-.085 2.865 1.839 6.286 2.91 9.966 2.91 12.002 0 18.558-9.919 18.558-18.558v-.888c1.27-.922 2.375-2.074 3.25-3.397z"/></svg>
              </a>
            )}
            {footerContent.socialMedia?.whatsapp && (
              <a href={footerContent.socialMedia.whatsapp} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-red-600 transition-colors" aria-label="WhatsApp">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              </a>
            )}
          </div>
        </div>

        {/* Information */}
        <div>
          <h3 className="text-white text-lg font-semibold mb-4">Información</h3>
          <ul className="space-y-2 text-sm">
            {footerInfoMenus.map(item => <div key={item.id}>{renderLink(item)}</div>)}
          </ul>
        </div>

        {/* My Account */}
        <div>
          <h3 className="text-white text-lg font-semibold mb-4">Mi Cuenta</h3>
          <ul className="space-y-2 text-sm">
            {footerAccountMenus.map(item => <div key={item.id}>{renderLink(item)}</div>)}
          </ul>
        </div>

        {/* Contact Us */}
        <div>
          <h3 className="text-white text-lg font-semibold mb-4">Contáctanos</h3>
          <address className="not-italic text-sm space-y-2">
            <p dangerouslySetInnerHTML={{ __html: (footerContent?.contactAddress || '').replace(/\n/g, '<br/>') }}></p>
            {footerContent?.contactPhone && (
              <p>Teléfono: <a href={`tel:${footerContent.contactPhone.replace(/\s/g, '')}`} className="hover:text-red-600 transition-colors">{footerContent.contactPhone}</a></p>
            )}
            {footerContent?.contactEmail && (
              <p>Email: <a href={`mailto:${footerContent.contactEmail}`} className="hover:text-red-600 transition-colors">{footerContent.contactEmail}</a></p>
            )}
            {footerContent?.contactHours && (
              <p>Horario: {footerContent.contactHours}</p>
            )}
          </address>
        </div>
      </div>

      <div className="border-t border-gray-800 mt-8 pt-8">
        <div className="text-center text-sm text-gray-500 dark:text-gray-400 mb-2">
          &copy; {new Date().getFullYear()} {footerContent?.copyrightText || ''}
        </div>
        <div className="text-center text-sm">
          <a
            href="https://wa.me/5492245506078"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-red-600 transition-colors inline-flex items-center space-x-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            <span>Desarrollado por Surconexion</span>
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;