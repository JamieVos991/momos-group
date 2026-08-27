<script setup>
const route = useRoute();
// gebruiker is al gevuld tijdens server-rendering (komt uit de sessie-cookie),
// dus de sidebar en inhoud zijn meteen zichtbaar, ook zonder JavaScript.
// Wie hier mag komen wordt geregeld door app/middleware/auth.global.js.
const { user: gebruiker } = useUserSession();

const navItems = [
  { label: "Diensten", to: "/roosters" },
  { label: "Verlof", to: "/verlof" },
];
</script>

<template>
  <div class="medewerker-layout">
    <a href="#medewerker-hoofdinhoud" class="skip-link">Naar hoofdinhoud</a>

    <aside class="medewerker-sidebar">
      <h1 class="medewerker-sidebar__title">Momo's</h1>
      <div class="medewerker-sidebar__divider" />

      <nav class="medewerker-sidebar__nav">
        <NuxtLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          :aria-label="item.label"
          class="medewerker-sidebar__link"
          :class="{
            'medewerker-sidebar__link--active': route.path.startsWith(item.to),
          }"
        >
          <svg
            v-if="item.label === 'Diensten'"
            class="medewerker-sidebar__icon"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <rect
              x="3.5"
              y="4.5"
              width="17"
              height="16"
              rx="2"
              stroke="currentColor"
              stroke-width="1.6"
            />
            <path d="M3.5 9.5h17" stroke="currentColor" stroke-width="1.6" />
            <path
              d="M8 2.5v4M16 2.5v4"
              stroke="currentColor"
              stroke-width="1.6"
              stroke-linecap="round"
            />
          </svg>
          <svg
            v-else
            class="medewerker-sidebar__icon"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <circle
              cx="12"
              cy="12"
              r="4.5"
              stroke="currentColor"
              stroke-width="1.6"
            />
            <path
              d="M12 2.5v2.5M12 19v2.5M4.5 12H2M22 12h-2.5M5.6 5.6l1.75 1.75M16.65 16.65l1.75 1.75M18.4 5.6l-1.75 1.75M7.35 16.65l-1.75 1.75"
              stroke="currentColor"
              stroke-width="1.6"
              stroke-linecap="round"
            />
          </svg>

          <span>{{ item.label }}</span>
        </NuxtLink>
      </nav>

      <div v-if="gebruiker" class="medewerker-sidebar__footer">
        <p class="medewerker-sidebar__email">{{ gebruiker.email }}</p>

        <div class="medewerker-sidebar__footer-actions">
          <button
            type="button"
            class="medewerker-sidebar__icon-btn"
            aria-label="Meldingen"
          >
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M6 10a6 6 0 1 1 12 0v4.5l1.5 2.5h-15L6 14.5z"
                stroke="currentColor"
                stroke-width="1.6"
                stroke-linejoin="round"
              />
              <path
                d="M9.5 19.5a2.5 2.5 0 0 0 5 0"
                stroke="currentColor"
                stroke-width="1.6"
                stroke-linecap="round"
              />
            </svg>
          </button>

          <!-- Echt formulier i.p.v. een JS-click-handler, zodat uitloggen ook zonder JavaScript werkt -->
          <form action="/api/logout" method="post">
            <button
              type="submit"
              class="medewerker-sidebar__icon-btn"
              aria-label="Uitloggen"
            >
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M12 3.5v8"
                  stroke="currentColor"
                  stroke-width="1.6"
                  stroke-linecap="round"
                />
                <path
                  d="M7 5.8a8 8 0 1 0 10 0"
                  stroke="currentColor"
                  stroke-width="1.6"
                  stroke-linecap="round"
                />
              </svg>
            </button>
          </form>
        </div>
      </div>
    </aside>

    <!-- Geen v-if meer: de middleware regelt wie hier mag komen, dus de inhoud
         hoeft niet verstopt te worden achter een client-only check -->
    <main id="medewerker-hoofdinhoud" class="medewerker-content">
      <slot />
    </main>
  </div>
</template>

<style scoped>
.medewerker-layout {
  display: flex;
  min-height: 100vh;
  background: var(--c-light);
}

.medewerker-sidebar {
  width: 280px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  padding: var(--space-l) var(--space-m);
  background: var(--c-primary);
  color: var(--c-light);
  border-right: 1px solid hsla(0, 0%, 100%, 0.1);
}

.medewerker-sidebar__title {
  font-size: 1.5rem;
  padding-left: 0.75rem;
  font-weight: 700;
  margin-bottom: var(--space-m);
}

.medewerker-sidebar__divider {
  border-bottom: 1px solid hsla(0, 0%, 100%, 0.1);
  margin: 0 calc(-1 * var(--space-m)) var(--space-m);
}

.medewerker-sidebar__nav {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
  flex: 1;
}

.medewerker-sidebar__link {
  display: flex;
  align-items: center;
  gap: 0.9rem;
  padding: 0.75rem var(--space-m);
  border-radius: 0.75rem;
  color: hsl(0, 0%, 75%);
  text-decoration: none;
  transition: background var(--transition), color var(--transition);
}

.medewerker-sidebar__link:hover {
  background: hsla(0, 0%, 100%, 0.06);
}

.medewerker-sidebar__link--active {
  background: var(--c-navy);
  color: #fff;
  font-weight: 700;
}

.medewerker-sidebar__icon {
  width: 1.2rem;
  height: 1.2rem;
  flex-shrink: 0;
}

.medewerker-sidebar__footer {
  border-top: 1px solid hsla(0, 0%, 100%, 0.1);
  padding-top: var(--space-m);
  margin: 0 calc(-1 * var(--space-m));
  display: flex;
  flex-direction: column;
}

.medewerker-sidebar__email {
  font-size: 1rem;
  color: hsl(0, 0%, 75%);
  padding: 0 var(--space-m) var(--space-m);
  border-bottom: 1px solid hsla(0, 0%, 100%, 0.1);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.medewerker-sidebar__footer-actions {
  display: flex;
  gap: var(--space-m);
  padding: var(--space-m) var(--space-m) 0;

  /* Laat het logout-formulier onzichtbaar zijn voor de flex-layout,
     zodat de knop er precies zo uitziet als voorheen */
  form {
    display: contents;
  }
}

.medewerker-sidebar__icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.75rem;
  height: 1.75rem;
  border: none;
  border-radius: var(--radius);
  background: transparent;
  color: hsl(0, 0%, 80%);
  cursor: pointer;
  transition: background var(--transition);

  svg {
    width: 1.2rem;
    height: 1.2rem;
  }

  &:hover {
    background: hsla(0, 0%, 100%, 0.08);
  }
}

.medewerker-content {
  flex: 1;
  padding: var(--space-l);
  background: var(--c-primary);
  color: var(--c-light);
}

.medewerker-content :slotted(h2) {
  font-size: 0.9rem;
}

@media (max-width: 40rem) {
  .medewerker-layout {
    flex-direction: column;
  }

  .medewerker-sidebar {
    width: 100%;
    flex-direction: row;
    align-items: center;
    padding: var(--space-m);
    border-right: none;
    border-bottom: 1px solid hsla(0, 0%, 100%, 0.1);
  }

  .medewerker-sidebar__title,
  .medewerker-sidebar__divider {
    display: none;
  }

  .medewerker-sidebar__nav {
    flex-direction: row;
    gap: var(--space-xs);
    overflow-x: auto;
  }

  .medewerker-sidebar__link {
    padding: var(--space-s);
  }

  .medewerker-sidebar__link span {
    display: none;
  }

  .medewerker-sidebar__footer {
    flex-direction: row;
    align-items: center;
    width: auto;
    flex-shrink: 0;
    margin: 0 0 0 auto;
    padding-top: 0;
    border-top: none;
  }

  .medewerker-sidebar__email {
    display: none;
  }

  .medewerker-sidebar__footer-actions {
    padding: 0;
  }
}
</style>
