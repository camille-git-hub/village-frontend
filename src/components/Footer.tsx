export const Footer = () => {
  return (
    <footer className="bg-villagePink w-full fixed bottom-0 text-center mt-10">
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