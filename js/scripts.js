/* ============================================================
   Clima (OpenWeather)
   ============================================================ */
function getWeather(latitude, longitude) {
    const apiKey = 'f14497fe0950caded04c25c667f47774';
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric&lang=pt_br`;

    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro ao obter dados do clima');
            }
            return response.json();
        })
        .then(data => {
            const weatherDiv = document.getElementById('weather');
            if (!weatherDiv) return;

            const cityName = data.name;
            const temperature = Math.round(data.main.temp);
            const description = data.weather[0].description; // A descrição já está em português
            const icon = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;

            weatherDiv.innerHTML = `
                <img src="${icon}" alt="${description}" onerror="this.src='assets/img/portfolio/weather.png'" />
                <div class="weather-text">
                    <span class="weather-temp">${temperature} °C</span>
                    <span class="weather-city">${cityName} · ${description}</span>
                </div>
            `;
        })
        .catch(error => {
            console.error('Erro ao obter dados do clima:', error);
        });
}

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;
            getWeather(latitude, longitude);
        }, error => {
            console.error('Erro ao obter a localização:', error);
        });
    } else {
        console.error('Geolocalização não é suportada pelo seu navegador');
    }
}

/* ============================================================
   Formulário de contato (EmailJS)
   ============================================================ */
function validateEmail(email) {
    const re = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return re.test(String(email).toLowerCase());
}

// Public Key do EmailJS (pode ficar no frontend).
const EMAILJS_PUBLIC_KEY = "WBWQso3fPUVASJ3yP";

function sendEmail() {
    // Inicializar o EmailJS
    (function () {
        emailjs.init(EMAILJS_PUBLIC_KEY);
    })();

    // Capturar os dados do formulário
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const message = document.getElementById('message').value;

    if (!name || !message) {
        Swal.fire({
            icon: "error",
            text: "Verifique se os campos 'Nome', 'Mensagem' e 'Email' estão preenchidos!",
        });
        return; // Impede o envio do formulário
    }

    // Validação de e-mail
    if (!validateEmail(email)) {
        Swal.fire({
            icon: "error",
            text: "Por favor, insira um e-mail válido.",
        });
        return;
    }

    const templateParams = {
        name: name,
        email: email,
        phone: phone,
        message: message
    };

    const button = document.getElementById('submitButton');
    const originalHtml = button ? button.innerHTML : '';
    if (button) {
        button.disabled = true;
        button.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Enviando...';
    }

    // Enviar o e-mail
    emailjs.send("service_cgqj735", "template_xqb3x4e", templateParams)
        .then(function (response) {
            console.log("E-mail enviado com sucesso!", response);
            Swal.fire({
                icon: "success",
                text: "Mensagem enviada com sucesso!",
            });
            document.getElementById('contactForm').reset();
        }, function (error) {
            console.error("Erro ao enviar o e-mail", error);
            Swal.fire({
                icon: "error",
                title: "Erro ao enviar a mensagem!",
                text: "Favor, enviar um e-mail informando o erro para: alexandrequintili@outlook.com",
                timer: 10000
            });
        })
        .finally(function () {
            if (button) {
                button.disabled = false;
                button.innerHTML = originalHtml;
            }
        });
}

/* ============================================================
   Interface
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
    const root = document.documentElement;
    const nav = document.getElementById('mainNav');
    const progress = document.getElementById('scrollProgress');
    const navLinks = Array.from(document.querySelectorAll('.nav-links a'));
    const sections = navLinks
        .map(link => document.querySelector(link.getAttribute('href')))
        .filter(Boolean);

    /* --- Navbar, progresso e link ativo --- */
    const onScroll = () => {
        const y = window.scrollY;

        if (nav) nav.classList.toggle('scrolled', y > 8);

        if (progress) {
            const max = document.documentElement.scrollHeight - window.innerHeight;
            progress.style.width = `${max > 0 ? (y / max) * 100 : 0}%`;
        }

        let current = '';
        sections.forEach(section => {
            if (y >= section.offsetTop - window.innerHeight * 0.35) {
                current = `#${section.id}`;
            }
        });
        navLinks.forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === current);
        });
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    /* --- Tema claro / escuro --- */
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
            root.setAttribute('data-theme', next);
            localStorage.setItem('theme', next);
            const meta = document.querySelector('meta[name="theme-color"]');
            if (meta) meta.setAttribute('content', next === 'light' ? '#fbf6f6' : '#0f0708');
        });
    }

    /* --- Menu mobile --- */
    const navToggle = document.getElementById('navToggle');
    const mobileMenu = document.getElementById('mobileMenu');
    const setMenu = open => {
        if (!mobileMenu || !navToggle) return;
        mobileMenu.classList.toggle('open', open);
        navToggle.setAttribute('aria-expanded', String(open));
        navToggle.innerHTML = open ? '<i class="fas fa-xmark"></i>' : '<i class="fas fa-bars"></i>';
        document.body.classList.toggle('no-scroll', open);
    };

    if (navToggle) {
        navToggle.addEventListener('click', () => setMenu(!mobileMenu.classList.contains('open')));
        mobileMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => setMenu(false));
        });
    }

    /* --- Modais --- */
    let lastFocused = null;

    const openModal = modal => {
        if (!modal) return;
        lastFocused = document.activeElement;
        // Carrega o iframe apenas quando o modal abre
        modal.querySelectorAll('iframe[data-src]').forEach(frame => {
            if (!frame.getAttribute('src')) frame.setAttribute('src', frame.dataset.src);
        });
        modal.classList.add('open');
        document.body.classList.add('no-scroll');
        const close = modal.querySelector('[data-modal-close]');
        if (close) close.focus();
        // Avisa os jogos próprios (canvas/DOM) que o modal entrou em cena
        modal.dispatchEvent(new CustomEvent('modal:open', { bubbles: true }));
    };

    const closeModal = modal => {
        if (!modal) return;
        modal.classList.remove('open');
        document.body.classList.remove('no-scroll');
        // Descarrega o iframe para parar o jogo/som
        modal.querySelectorAll('iframe[data-src]').forEach(frame => frame.removeAttribute('src'));
        modal.dispatchEvent(new CustomEvent('modal:close', { bubbles: true }));
        if (lastFocused) lastFocused.focus();
    };

    document.querySelectorAll('[data-modal-open]').forEach(trigger => {
        const target = () => document.getElementById(trigger.dataset.modalOpen);
        trigger.addEventListener('click', () => openModal(target()));
        trigger.addEventListener('keydown', event => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                openModal(target());
            }
        });
    });

    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', event => {
            if (event.target === modal) closeModal(modal);
        });
        modal.querySelectorAll('[data-modal-close]').forEach(button => {
            button.addEventListener('click', () => closeModal(modal));
        });
    });

    document.addEventListener('keydown', event => {
        if (event.key !== 'Escape') return;
        document.querySelectorAll('.modal.open').forEach(closeModal);
        if (mobileMenu && mobileMenu.classList.contains('open')) setMenu(false);
    });

    /* --- Animação de entrada --- */
    const revealables = document.querySelectorAll('.reveal');
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add('visible');
                obs.unobserve(entry.target);
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

        revealables.forEach((element, index) => {
            element.style.transitionDelay = `${(index % 4) * 90}ms`;
            observer.observe(element);
        });

        // Rede de segurança: se por algum motivo o observer não disparar,
        // o conteúdo aparece mesmo assim.
        setTimeout(() => {
            revealables.forEach(element => {
                const box = element.getBoundingClientRect();
                if (box.top < window.innerHeight) element.classList.add('visible');
            });
        }, 2500);
    } else {
        revealables.forEach(element => element.classList.add('visible'));
    }
});

window.addEventListener('load', getLocation);
