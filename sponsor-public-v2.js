/* SPONSOR PUBBLICI — barra scorrevole automatica, senza duplicazione DOM */
(function () {
    'use strict';

    let animationFrame = 0;
    let animationRunning = false;
    let animationPaused = false;
    let lastTimestamp = 0;
    let positions = [];
    const SPEED = 22;
    const GAP = 14;

    function getClient() {
        return window.supabaseClient || window.sb || null;
    }

    function escapeHtml(value) {
        return String(value ?? '').replace(/[&<>"']/g, function (char) {
            return {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;'
            }[char];
        });
    }

    function addStyles() {
        if (document.getElementById('sponsor-public-v2-style')) return;
        const style = document.createElement('style');
        style.id = 'sponsor-public-v2-style';
        style.textContent = `
#sponsor-public-wrap{display:block;width:100%;margin:22px 0 8px;padding:0;box-sizing:border-box;clear:both}
#sponsor-public-title{text-align:center;margin:0 0 10px;color:rgba(255,255,255,.88);font-size:10px;font-weight:800;letter-spacing:2px;text-transform:uppercase;text-shadow:0 2px 8px rgba(0,0,0,.35)}
#sponsor-public-window{display:block;position:relative;width:100%;height:91px;overflow:hidden;border:1px solid rgba(255,255,255,.28);border-radius:20px;background:linear-gradient(135deg,rgba(255,255,255,.16),rgba(255,255,255,.055));backdrop-filter:blur(16px) saturate(145%);-webkit-backdrop-filter:blur(16px) saturate(145%);box-shadow:0 12px 34px rgba(0,0,0,.28),inset 0 1px 0 rgba(255,255,255,.18);box-sizing:border-box}
#sponsor-public-window::before{content:"";display:block;position:absolute;z-index:2;top:0;left:10%;right:10%;height:1px;background:linear-gradient(90deg,transparent,rgba(255,255,255,.55),transparent)}
#sponsor-public-track{position:relative;width:100%;height:100%;padding:0;box-sizing:border-box;will-change:transform}
.sponsor-public-item{position:absolute;top:8px;left:0;width:100px;height:75px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;padding:4px;border:1px solid rgba(255,255,255,.20);border-radius:12px;background:rgba(255,255,255,.08);color:#fff;text-decoration:none;box-sizing:border-box;box-shadow:inset 0 1px 0 rgba(255,255,255,.10);overflow:hidden;will-change:transform}
.sponsor-public-item:hover{background:rgba(255,255,255,.14);border-color:rgba(255,255,255,.34)}
.sponsor-public-logo-box{width:80px;height:50px;display:flex;align-items:center;justify-content:center;background:#fff;border-radius:6px;overflow:hidden;flex:0 0 50px}
.sponsor-public-logo{display:block;width:80px;height:50px;object-fit:contain;object-position:center;filter:drop-shadow(0 1px 3px rgba(0,0,0,.16))}
.sponsor-public-name{display:block;width:92px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;text-align:center;font-size:9px;font-weight:800;line-height:13px;color:#fff}
.sponsor-public-empty{width:100%;text-align:center;padding:15px;color:rgba(255,255,255,.70);font-size:11px}
@media(max-width:599px){#sponsor-public-wrap{margin:18px 0 6px}#sponsor-public-title{font-size:8px;letter-spacing:1.5px}#sponsor-public-window{height:82px;border-radius:17px}.sponsor-public-item{top:5px;width:92px;height:70px}.sponsor-public-logo-box{width:80px;height:48px;flex-basis:48px}.sponsor-public-logo{width:80px;height:48px}.sponsor-public-name{width:84px;font-size:8px}}
`;
        document.head.appendChild(style);
    }

    function findTarget() {
        const page = location.pathname.toLowerCase();
        if (page.endsWith('/bove.html') || page.endsWith('bove.html')) {
            return document.querySelector('.container') || document.querySelector('main');
        }
        if (page.endsWith('/2page.html') || page.endsWith('2page.html')) {
            return document.querySelector('.box') || document.querySelector('main');
        }
        if (page.endsWith('/visitatore.html') || page.endsWith('visitatore.html')) {
            return document.querySelector('.np-sponsor-slot') || document.querySelector('main') || document.body;
        }
        return document.querySelector('main') || document.querySelector('.container') || document.body;
    }

    function placeSponsor() {
        const wrap = document.getElementById('sponsor-public-wrap');
        const target = findTarget();
        if (!wrap || !target) return false;
        if (wrap.parentElement !== target) target.appendChild(wrap);
        return true;
    }

    function ensureUI() {
        let wrap = document.getElementById('sponsor-public-wrap');
        if (wrap) {
            placeSponsor();
            return wrap;
        }
        wrap = document.createElement('section');
        wrap.id = 'sponsor-public-wrap';
        wrap.setAttribute('aria-label', 'Sponsor');
        wrap.innerHTML = `
            <div id="sponsor-public-title">Sponsorizzato da</div>
            <div id="sponsor-public-window">
                <div id="sponsor-public-track">
                    <div class="sponsor-public-empty">Caricamento sponsor...</div>
                </div>
            </div>
        `;
        const target = findTarget();
        if (target) target.appendChild(wrap);
        else document.body.appendChild(wrap);
        return wrap;
    }

    function stopSponsorAnimation() {
        animationRunning = false;
        lastTimestamp = 0;
        if (animationFrame) cancelAnimationFrame(animationFrame);
        animationFrame = 0;
    }

    function getCardWidth(card) {
        return card ? card.getBoundingClientRect().width || 100 : 100;
    }

    function layoutCards() {
        const track = document.getElementById('sponsor-public-track');
        const windowElement = document.getElementById('sponsor-public-window');
        if (!track || !windowElement) return;

        const cards = Array.from(track.querySelectorAll('.sponsor-public-item'));
        if (!cards.length) return;

        const width = windowElement.clientWidth;
        const cardWidth = getCardWidth(cards[0]);
        positions = cards.map(function (_, index) {
            if (cards.length === 1) return (width - cardWidth) / 2;
            return index * (cardWidth + GAP);
        });

        cards.forEach(function (card, index) {
            card.style.transform = 'translate3d(' + positions[index] + 'px,0,0)';
        });
    }

    function sponsorAnimationStep(timestamp) {
        if (!animationRunning) return;

        const track = document.getElementById('sponsor-public-track');
        const windowElement = document.getElementById('sponsor-public-window');
        if (!track || !windowElement) {
            stopSponsorAnimation();
            return;
        }

        const cards = Array.from(track.querySelectorAll('.sponsor-public-item'));
        if (!cards.length) {
            stopSponsorAnimation();
            return;
        }

        if (!lastTimestamp) lastTimestamp = timestamp;
        const elapsed = Math.min(timestamp - lastTimestamp, 80);
        lastTimestamp = timestamp;

        if (!animationPaused) {
            const width = windowElement.clientWidth;
            cards.forEach(function (card, index) {
                const cardWidth = getCardWidth(card);
                positions[index] -= (SPEED * elapsed) / 1000;
                if (positions[index] < -cardWidth) {
                    const rightMost = Math.max.apply(null, positions);
                    positions[index] = rightMost + cardWidth + GAP;
                }
                card.style.transform = 'translate3d(' + positions[index] + 'px,0,0)';
            });
        }

        animationFrame = requestAnimationFrame(sponsorAnimationStep);
    }

    function startSponsorAnimation() {
        stopSponsorAnimation();
        const track = document.getElementById('sponsor-public-track');
        if (!track) return;
        const cards = track.querySelectorAll('.sponsor-public-item');
        if (!cards.length) return;

        layoutCards();
        animationRunning = true;
        animationPaused = false;
        lastTimestamp = 0;
        animationFrame = requestAnimationFrame(sponsorAnimationStep);
    }

    function bindSponsorPause() {
        const windowElement = document.getElementById('sponsor-public-window');
        if (!windowElement || windowElement.dataset.pauseBound === '1') return;
        windowElement.dataset.pauseBound = '1';

        windowElement.addEventListener('mouseenter', function () {
            animationPaused = true;
        });
        windowElement.addEventListener('mouseleave', function () {
            animationPaused = false;
            lastTimestamp = 0;
        });
        windowElement.addEventListener('touchstart', function () {
            animationPaused = true;
        }, { passive: true });
        windowElement.addEventListener('touchend', function () {
            animationPaused = false;
            lastTimestamp = 0;
        }, { passive: true });
        windowElement.addEventListener('focusin', function () {
            animationPaused = true;
        });
        windowElement.addEventListener('focusout', function () {
            animationPaused = false;
            lastTimestamp = 0;
        });
    }

    function render(sponsors) {
        const track = document.getElementById('sponsor-public-track');
        if (!track) return;

        stopSponsorAnimation();

        if (!sponsors.length) {
            track.innerHTML = '<div class="sponsor-public-empty">Nessuno sponsor disponibile</div>';
            return;
        }

        const cards = sponsors.map(function (sponsor) {
            const logo = sponsor.immagine
                ? `<span class="sponsor-public-logo-box"><img class="sponsor-public-logo" src="${escapeHtml(sponsor.immagine)}" alt="${escapeHtml(sponsor.nome)}" loading="lazy"></span>`
                : '';
            const name = `<span class="sponsor-public-name">${escapeHtml(sponsor.nome)}</span>`;
            const content = logo + name;
            if (sponsor.link) {
                return `<a class="sponsor-public-item" href="${escapeHtml(sponsor.link)}" target="_blank" rel="noopener noreferrer">${content}</a>`;
            }
            return `<div class="sponsor-public-item">${content}</div>`;
        }).join('');

        track.innerHTML = cards;
        bindSponsorPause();
        requestAnimationFrame(startSponsorAnimation);
    }

    async function loadSponsors() {
        const client = getClient();
        if (!client || !client.from) return;
        try {
            const result = await client.from('sponsor').select('id,nome,immagine,video,link').order('id', { ascending: true });
            if (result.error) {
                console.error('Sponsor pubblici:', result.error);
                return;
            }
            const sponsors = (result.data || []).filter(function (sponsor) {
                return sponsor && sponsor.nome;
            });
            window.__PUBLIC_SPONSORS__ = sponsors;
            render(sponsors);
        } catch (error) {
            console.error('Errore caricamento sponsor pubblici:', error);
        }
    }

    function start() {
        addStyles();
        const page = location.pathname.toLowerCase();
        if (page.endsWith('/2page.html') || page.endsWith('2page.html')) {
            const legacy = document.querySelector('.sponsor-banner');
            if (legacy) legacy.style.display = 'none';
        }
        ensureUI();
        loadSponsors();
    }

    window.addEventListener('resize', function () {
        if (!animationRunning) return;
        layoutCards();
    });

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', start, { once: true });
    } else {
        start();
    }
})();
