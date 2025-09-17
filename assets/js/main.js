// Minimal, dependency‑free JS
(function(){
  const y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();

  const form = document.getElementById('contact-form');
  const status = document.getElementById('form-status');
  if(form){
    form.addEventListener('submit', function(e){
      e.preventDefault();
      if(status) status.textContent = 'Sending…';
      // Simulate send
      setTimeout(function(){
        if(status) status.textContent = 'Thanks! We\'ll get back within 1 business day.';
        form.reset();
      }, 700);
    });
  }
})();
