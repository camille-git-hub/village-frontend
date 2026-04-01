export const Footer = () => {
  return (
    <footer className="bg-gray-200 w-full bottom-0 p-3 shadow-md text-center">
        <p>
            Contact us: <a href="mailto:info@village.com" className="text-villageRed hover:underline">
                info@village.com
            </a>
        </p>
        <p className="text-sm text-gray-600">
            &copy; {new Date().getFullYear()} Village. All rights reserved.
        </p>
    </footer>
  );
};

export default Footer;