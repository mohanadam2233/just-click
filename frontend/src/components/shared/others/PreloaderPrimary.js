import Preloader from "./Preloader";

const PreloaderPrimary = () => {
  return (
    <div className="animate-preloader opacity-0 invisible fixed top-0 left-0 -z-1 w-full transition-all duration-300">
      <Preloader />
    </div>
  );
};

export default PreloaderPrimary;
