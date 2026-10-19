[1mdiff --git a/script.js b/script.js[m
[1mindex e435d66..9beca38 100644[m
[1m--- a/script.js[m
[1m+++ b/script.js[m
[36m@@ -124,13 +124,18 @@[m [mfunction initContactForm() {[m
   const feedback = document.getElementById('form-feedback');[m
   if (!form || !feedback) return;[m
 [m
[32m+[m[32m  const FORM_ENDPOINT = 'https://formspree.io/f/mljgvvkb'; // <- paste your Formspree URL[m
[32m+[m[32m  const submitBtn = document.getElementById('form-submit');[m
[32m+[m[32m  const msg = (key, fallback) => (window.I18N ? I18N.msg(key) : fallback);[m
[32m+[m
   const required = ['field-company', 'field-name', 'field-email', 'field-message'][m
     .map((id) => document.getElementById(id));[m
 [m
[31m-  form.addEventListener('submit', (event) => {[m
[32m+[m[32m  form.addEventListener('submit', async (event) => {[m
     event.preventDefault();[m
     feedback.className = 'form__feedback';[m
 [m
[32m+[m[32m    /* ---------- Validation ---------- */[m
     let valid = true;[m
     required.forEach((input) => {[m
       const empty = !input.value.trim();[m
[36m@@ -141,15 +146,21 @@[m [mfunction initContactForm() {[m
     });[m
 [m
     if (!valid) {[m
[31m-      feedback.textContent = 'Please fill in the required fields correctly.';[m
[32m+[m[32m      feedback.textContent = msg('formError', 'Please fill in the required fields correctly.');[m
       feedback.classList.add('is-error');[m
       return;[m
     }[m
 [m
[32m+[m[32m    /* ---------- Data ---------- */[m
     const data = new FormData(form);[m
[32m+[m
[32m+[m[32m    // Anti-spam: bots fill this hidden field, people don't[m
[32m+[m[32m    if (data.get('website')) return;[m
[32m+[m
     const payload = {[m
[31m-      services: data.getAll('service'),[m
[31m-      budget: data.get('budget'),[m
[32m+[m[32m      _subject: `New contact from ${data.get('name')} (${data.get('company')})`,[m
[32m+[m[32m      services: data.getAll('service').join(', '),[m
[32m+[m[32m      budget: data.get('budget') || '',[m
       company: data.get('company'),[m
       name: data.get('name'),[m
       email: data.get('email'),[m
[36m@@ -157,14 +168,34 @@[m [mfunction initContactForm() {[m
       message: data.get('message'),[m
     };[m
 [m
[31m-    // TODO: enviar `payload` para seu backend / serviço de e-mail (fetch, Formspree, EmailJS...)[m
[31m-    console.log('Form payload:', payload);[m
[31m-[m
[31m-    feedback.textContent = 'Thank you! Your message was sent.';[m
[31m-    feedback.classList.add('is-success');[m
[31m-    form.reset();[m
[32m+[m[32m    /* ---------- Sending ---------- */[m
[32m+[m[32m    submitBtn.disabled = true;[m
[32m+[m[32m    feedback.textContent = msg('formSending', 'Sending...');[m
[32m+[m
[32m+[m[32m    try {[m
[32m+[m[32m      const response = await fetch(FORM_ENDPOINT, {[m
[32m+[m[32m        method: 'POST',[m
[32m+[m[32m        headers: {[m
[32m+[m[32m          'Content-Type': 'application/json',[m
[32m+[m[32m          'Accept': 'application/json',[m
[32m+[m[32m        },[m
[32m+[m[32m        body: JSON.stringify(payload),[m
[32m+[m[32m      });[m
[32m+[m
[32m+[m[32m      if (!response.ok) throw new Error('Request failed');[m
[32m+[m
[32m+[m[32m      feedback.textContent = msg('formSuccess', 'Thank you! Your message was sent.');[m
[32m+[m[32m      feedback.classList.add('is-success');[m
[32m+[m[32m      form.reset(); // only clears when the message was really sent[m
[32m+[m[32m    } catch (error) {[m
[32m+[m[32m      feedback.textContent = msg('formFailed', 'Something went wrong. Please try again.');[m
[32m+[m[32m      feedback.classList.add('is-error');[m
[32m+[m[32m    } finally {[m
[32m+[m[32m      submitBtn.disabled = false;[m
[32m+[m[32m    }[m
   });[m
 [m
[32m+[m[32m  /* ---------- Remove the red border while typing ---------- */[m
   form.addEventListener('input', (event) => {[m
     if (event.target.classList.contains('is-invalid')) {[m
       event.target.classList.remove('is-invalid');[m
