const slides = document.getElementById("testimonial-slides");
  const dots = document.querySelectorAll("#testimonial-dots button");
  let index = 0;

  function showSlide(i) {
    index = i;
    slides.style.transform = `translateX(-${100 * index}%)`;
    dots.forEach((dot, idx) => {
      dot.classList.toggle("bg-gray-400", idx === index);
      dot.classList.toggle("bg-gray-300", idx !== index);
    });
  }

  // Auto Slide
  function autoSlide() {
    index = (index + 1) % dots.length;
    showSlide(index);
  }
  let slideInterval = setInterval(autoSlide, 5000);

  // Dot Click
  dots.forEach((dot, i) => {
    dot.addEventListener("click", () => {
      clearInterval(slideInterval);
      showSlide(i);
      slideInterval = setInterval(autoSlide, 5000);
    });
  });