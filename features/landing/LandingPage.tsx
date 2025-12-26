const LandingPage = () => {
  return (
    <main className="w-full">
      {/* Navbar */}
      <header>
        <header className="w-full border-b">
  <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-1">

    {/* Logo */}
    <div className="flex items-center gap-2">
      <img src="/sajilofix_logo.png" alt="Sajilo Fix" className="h-25 w-25" />
      {/* <span className="text-xl font-bold text-blue-700">
        
      </span> */}
    </div>
    
    {/* Actions */}
    <div className="flex items-center gap-6">
      <button className="text-gray-700 hover:text-blue-600">
        Explore Issues
      </button>

      <button className="bg-[rgba(53,51,205,1)] text-white border px-4 py-2 rounded-lg hover:bg-black">
        Sign In
      </button>
    </div>

  </div>
</header>

      </header>

      {/* Hero Section */}
      <section>
        <section className="bg-gradient-to-b from-blue-100 to-white py-24">
  <div className="max-w-4xl mx-auto text-center px-6">

    <span className="inline-block bg-blue-200 text-blue-700 text-sm px-4 py-1 rounded-full mb-4">
      Empowering Citizens to Build Better Cities
    </span>

    <h1 className="text-amber-900 text-5xl font-bold mt-4">
      Report. Resolve. Revive.
    </h1>

    <p className="text-gray-600 mt-6 text-lg">
      Transform your community by reporting civic issues and tracking their
      resolution in real-time. Join thousands of citizens making Nepal better,
      one report at a time.
    </p>

    <div className="mt-8 flex justify-center gap-4">
      <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
        Report an Issue
      </button>

      <button className="border px-6 py-3 rounded-lg hover:bg-gray-100">
        Explore Issues
      </button>
    </div>

  </div>
</section>

      </section>

      {/* Stats Section */}
      <section>
        <section className="py-16 border-t">
  <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 text-center gap-8">

    <div>
      <div className="w-14 h-14 mx-auto bg-blue-300 rounded-full flex items-center justify-center mb-4">
        📄
      </div>
      <h3 className="text-2xl font-bold">2,847</h3>
      <p className="text-gray-600">Issues Reported</p>
    </div>

    <div>
      <div className="w-18 h-18 mx-auto bg-blue-300 rounded-full flex items-center justify-center mb-4">
        📜
      </div>
      <h3 className="text-2xl font-bold">1,923</h3>
      <p className="text-gray-600">Issues Resolved</p>
    </div>

    <div>
      <div className="w-14 h-14 mx-auto bg-blue-300 rounded-full flex items-center justify-center mb-4">
        👥
      </div>
      <h3 className="text-2xl font-bold">5,432</h3>
      <p className="text-gray-600">Active Citizens</p>
    </div>

  </div>
</section>

      </section>

      {/* How It Works */}
      <section>
        <section className="py-20 bg-gray-50">
  <div className="max-w-4xl mx-auto text-center px-6">

    <h2 className="text-3xl font-bold">How It Works</h2>
    <p className="text-gray-600 mt-2">
      Three simple steps to make your community better
    </p>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">

      <div>
        <h3 className="font-semibold text-lg">Report Issue</h3>
        <p className="text-gray-600 mt-2">
          Easily submit civic issues from your locality.
        </p>
      </div>

      <div>
        <h3 className="font-semibold text-lg">Authority Action</h3>
        <p className="text-gray-600 mt-2">
          Authorities review and take action promptly.
        </p>
      </div>

      <div>
        <h3 className="font-semibold text-lg">Track Resolution</h3>
        <p className="text-gray-600 mt-2">
          Get real-time updates until the issue is resolved.
        </p>
      </div>

    </div>

  </div>
</section>

      </section>

      {/* Footer */}
      <footer>
        <footer className="bg-gradient-to-b from-[#041027] via-[#3533cd] to-[#041027] text-white border-t py-6 text-center text-gray-900 text-sm">
            © {new Date().getFullYear()} Sajilo Fix. All rights reserved.
        </footer>

      </footer>
    </main>
  );
};

export default LandingPage;
