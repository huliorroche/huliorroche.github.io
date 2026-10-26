(() => {
    "use strict";

    const ACCESS_PARAM = "access";

    function getCurrentAccessToken() {
        const params = new URLSearchParams(window.location.search);
        return params.get(ACCESS_PARAM);
    }

    function addAccessTokenToLink(link, accessToken) {
        if (!link || !accessToken) {
            return;
        }

        const href = link.getAttribute("href");

        // Enlaces que no deben modificarse
        if (
            !href ||
            href.startsWith("#") ||
            href.startsWith("javascript:") ||
            href.startsWith("mailto:") ||
            href.startsWith("tel:")
        ) {
            return;
        }

        try {
            const url = new URL(href, window.location.href);

            // Solo enlaces del mismo dominio/protocolo/puerto
            if (url.origin !== window.location.origin) {
                return;
            }

            // Si ya tiene access, mantenemos el valor existente.
            // Si prefieres sobrescribirlo, cambia esto por:
            // url.searchParams.set(ACCESS_PARAM, accessToken);
            if (!url.searchParams.has(ACCESS_PARAM)) {
                url.searchParams.append(ACCESS_PARAM, accessToken);
            }

            link.setAttribute("href", url.href);
        } catch (error) {
            console.warn("No se pudo procesar el enlace:", href, error);
        }
    }

    function updateLinks(root = document) {
        const accessToken = getCurrentAccessToken();

        if (!accessToken) {
            return;
        }

        root.querySelectorAll("a[href]").forEach(link => {
            addAccessTokenToLink(link, accessToken);
        });
    }

    function init() {
        updateLinks();

        // También procesa enlaces añadidos dinámicamente
        const observer = new MutationObserver(mutations => {
            const accessToken = getCurrentAccessToken();

            if (!accessToken) {
                return;
            }

            for (const mutation of mutations) {
                for (const node of mutation.addedNodes) {
                    if (!(node instanceof Element)) {
                        continue;
                    }

                    if (node.matches("a[href]")) {
                        addAccessTokenToLink(node, accessToken);
                    }

                    node.querySelectorAll("a[href]").forEach(link => {
                        addAccessTokenToLink(link, accessToken);
                    });
                }
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();