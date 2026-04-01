import IconOnly from "../assets/IconOnly_Transparent.png";
import { SignUpForm } from "../components/SignUpForm";

export const LandingPage = () => {
  return (
    <main className="min-h-screen bg-white">
      <section className="relative">
        <div className="container mx-auto px-4 py-2">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-8">
            {/* LEFT: red block with logo / community image */}
            <div className="md:w-1/2 relative z-30">
              <div
                className="bg-villageRed w-full h-64 md:h-96 flex items-center justify-center"
                aria-hidden="true"
              >
                {/* If you have a PNG/photo replace the inner block with <img> */}
                <img src={IconOnly} alt="Village logo" className="w-full mt-20 md:w-full" />
                {/* optionally overlay text in the box */}
                {/* <div className="absolute left-6 top-6 text-white">Image with community of women</div> */}
              </div>
            </div>

            {/* RIGHT: content with pale-pink backdrop behind it */}
            <div className="md:w-1/2 relative flex justify-center md:justify-start">
              {/* pale pink backdrop (positioned and sized to match Figma) */}
              <div
                className="absolute -left-8 md:-left-48 top-12 md:top-8 w-[320px] md:w-[520px] h-56 md:h-[330px] bg-villagePink rounded-md z-10"
                aria-hidden="true"
              />

              {/* actual content card that sits above the pink backdrop */}
              <div className="relative z-20 max-w-md p-6 md:p-8">
                <h1 className="text-3xl mb-16 mt-8 md:text-3xl text-center font-semibold">Connect with your village</h1>
                <p className="mt-4 mb-12 text-sm text-gray-600">
                  Village is a community for women — discover and book local, women-led services, exchange advice, and build professional and casual connections in your neighborhood.
                </p>

                <div className="mt-6">
                  <SignUpForm />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default LandingPage;



//<p>Village is a community for women — discover and book local, women-led services, exchange advice, and build professional and casual connections in your neighborhood.</p>