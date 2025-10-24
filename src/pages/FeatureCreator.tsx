<![CDATA[
      </section>

      {/* Education Carousel Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-700">
              深入了解 KeyBox 如何幫助你成長
            </h2>
            <p className="text-xl text-slate-600">
              掌握 Email 行銷的關鍵技巧，開始你的內容變現之旅
            </p>
          </div>

          {/* Carousel Container */}
          <div className="relative">
            <div className="overflow-hidden rounded-3xl shadow-2xl">
              {slides.map((slide, index) => (
                <div
                  key={slide.id}
                  className={`transition-all duration-1000 ease-in-out ${
                    index === activeSlide ? 'block' : 'hidden'
                  }`}
                >
                  <div className={`${slide.bgClass} p-8 md:p-12 lg:p-16 min-h-[600px] flex items-center`}>
                    {slide.content}
                  </div>
                </div>
              ))}
            </div>

            {/* Navigation Arrows */}
            <button
              onClick={handlePrevSlide}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/10 backdrop-blur-sm hover:bg-white/20 rounded-full p-3 transition-all duration-200 border border-white/20"
            >
              <ChevronLeft className="w-6 h-6 text-white" />
            </button>
            <button
              onClick={handleNextSlide}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/10 backdrop-blur-sm hover:bg-white/20 rounded-full p-3 transition-all duration-200 border border-white/20"
            >
              <ChevronRight className="w-6 h-6 text-white" />
            </button>

            {/* Progress Bar */}
            <div className="mt-8 bg-slate-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-green-400 to-emerald-500 h-full transition-all duration-1000 ease-linear rounded-full"
                style={{ width: `${((activeSlide + 1) / slides.length) * 100}%` }}
              />
            </div>

            {/* Dots Navigation */}
            <div className="flex justify-center space-x-3 mt-6">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => handleDotClick(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === activeSlide
                      ? 'bg-green-500 scale-125 shadow-lg'
                      : 'bg-slate-300 hover:bg-slate-400'
                  }`}
                />
              ))}
            </div>

            {/* Slide Counter */}
            <div className="text-center mt-4">
              <span className="text-slate-600 font-medium">
                {activeSlide + 1} / {slides.length}
              </span>
            </div>
          </div>

          {/* Call to Action */}
          <div className="text-center mt-12">
            <p className="text-lg text-slate-600 mb-6">
              準備好開始收集你的第一個 Email 名單了嗎？
            </p>
            <Button
              size="lg"
              onClick={() => navigate("/login")}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 text-lg font-semibold shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              立即免費開始 <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center bg-[#EEF5FF]" style={{boxShadow: '0 0 6px 0 #3e8e9cff'}}>
              <CardContent className="pt-6">
                <Package className="w-12 h-12 text-green-600 mx-auto mb-4" />
                <div className="text-4xl font-bold text-green-600 mb-2">500+</div>
                <p className="text-slate-600">創作者正在使用</p>
              </CardContent>
            </Card>
            <Card className="text-center bg-[#EEF5FF]" style={{boxShadow: '0 0 6px 0 #3e8e9cff'}}>
              <CardContent className="pt-6">
                <Users className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <div className="text-4xl font-bold text-blue-600 mb-2">10K+</div>
                <p className="text-slate-600">資料包已分發</p>
              </CardContent>
            </Card>
            <Card className="text-center bg-[#EEF5FF]" style={{boxShadow: '0 0 6px 0 #3e8e9cff'}}>
              <CardContent className="pt-6">
                <TrendingUp className="w-12 h-12 text-green-600 mx-auto mb-4" />
                <div className="text-4xl font-bold text-green-600 mb-2">300%</div>
                <p className="text-slate-600">平均提升轉換率</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};

export default FeatureCreator;
]]>