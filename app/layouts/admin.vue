<script setup>
const route = useRoute();
const { user } = useUserSession();

const navItems = [
  { label: "Diensten", to: "/admin/diensten" },
  { label: "Evenementen", to: "/admin/evenementen" },
  { label: "Verlof", to: "/admin/verlof" },
  { label: "Medewerkers", to: "/admin/medewerkers" },
  { label: "Functies", to: "/admin/functies" },
];
</script>

<template>
  <div class="admin-layout">
    <a href="#admin-hoofdinhoud" class="skip-link">Naar hoofdinhoud</a>

    <aside class="admin-sidebar">
      <h1 class="admin-sidebar__title">Beheer</h1>
      <div class="admin-sidebar__divider" />

      <nav class="admin-sidebar__nav">
        <NuxtLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          :aria-label="item.label"
          class="admin-sidebar__link"
          :class="{
            'admin-sidebar__link--active': route.path.startsWith(item.to),
          }"
        >
          <svg
            v-if="item.label === 'Diensten'"
            class="admin-sidebar__icon"
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
            v-else-if="item.label === 'Evenementen'"
            class="admin-sidebar__icon"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M12 3.5l2.55 5.17 5.7.83-4.13 4.02.98 5.68L12 16.4l-5.1 2.8.98-5.68-4.13-4.02 5.7-.83z"
              stroke="currentColor"
              stroke-width="1.6"
              stroke-linejoin="round"
            />
          </svg>
          <svg
            v-else-if="item.label === 'Verlof'"
            class="admin-sidebar__icon"
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
          <svg
            v-else-if="item.label === 'Medewerkers'"
            class="admin-sidebar__icon"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <circle cx="9" cy="8" r="3" stroke="currentColor" stroke-width="1.6" />
            <path
              d="M3.5 19c0-3 2.5-5 5.5-5s5.5 2 5.5 5"
              stroke="currentColor"
              stroke-width="1.6"
              stroke-linecap="round"
            />
            <path
              d="M15.5 5.5a3 3 0 0 1 0 5.5"
              stroke="currentColor"
              stroke-width="1.6"
              stroke-linecap="round"
            />
            <path
              d="M15.5 14c2.3.4 4 2.2 4 4.5"
              stroke="currentColor"
              stroke-width="1.6"
              stroke-linecap="round"
            />
          </svg>
          <svg
            v-else
            class="admin-sidebar__icon"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <rect
              x="3.5"
              y="7.5"
              width="17"
              height="12"
              rx="2"
              stroke="currentColor"
              stroke-width="1.6"
            />
            <path
              d="M8 7.5V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v1.5"
              stroke="currentColor"
              stroke-width="1.6"
            />
          </svg>

          <span>{{ item.label }}</span>
        </NuxtLink>
      </nav>

      <div v-if="user" class="admin-sidebar__footer">
        <p class="admin-sidebar__email">{{ user.email }}</p>

        <div class="admin-sidebar__footer-actions">
          <button
            type="button"
            class="admin-sidebar__icon-btn"
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

          <form action="/api/logout" method="post">
            <button
              type="submit"
              class="admin-sidebar__icon-btn"
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

    <main id="admin-hoofdinhoud" class="admin-content">
      <slot />
    </main>
  </div>
</template>

<style scoped>
.admin-layout {
  display: flex;
  min-height: 100vh;
  background: var(--c-light);
}

.admin-sidebar {
  width: 280px;
  height: 100vh;
  position: sticky;
  top: 0;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  padding: var(--space-l) var(--space-m);
  background: var(--c-primary);
  color: var(--c-light);
  border-right: 1px solid hsla(0, 0%, 100%, 0.1);
  overflow-y: auto;
}

.admin-sidebar__title {
  font-size: 1.5rem;
  padding-left: 0.75rem;
  font-weight: 700;
  margin-bottom: var(--space-m);
}

.admin-sidebar__divider {
  border-bottom: 1px solid hsla(0, 0%, 100%, 0.1);
  margin: 0 calc(-1 * var(--space-m)) var(--space-m);
}

.admin-sidebar__nav {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
  flex: 1;
}

.admin-sidebar__link {
  display: flex;
  align-items: center;
  gap: 0.9rem;
  padding: 0.75rem var(--space-m);
  border-radius: 0.75rem;
  color: hsl(0, 0%, 75%);
  text-decoration: none;
  transition: background var(--transition), color var(--transition);
}

.admin-sidebar__link:hover {
  background: hsla(0, 0%, 100%, 0.06);
}

.admin-sidebar__link--active {
  background: var(--c-navy);
  color: #fff;
  font-weight: 700;
}

.admin-sidebar__icon {
  width: 1.2rem;
  height: 1.2rem;
  flex-shrink: 0;
}

.admin-sidebar__footer {
  border-top: 1px solid hsla(0, 0%, 100%, 0.1);
  padding-top: var(--space-m);
  margin: 0 calc(-1 * var(--space-m));
  display: flex;
  flex-direction: column;
}

.admin-sidebar__email {
  font-size: 1 rem;
  color: hsl(0, 0%, 75%);
  padding: 0 var(--space-m) var(--space-m);
  border-bottom: 1px solid hsla(0, 0%, 100%, 0.1);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.admin-sidebar__footer-actions {
  display: flex;
  gap: var(--space-m);
  padding: var(--space-m) var(--space-m) 0;

  form {
    display: contents;
  }
}

.admin-sidebar__icon-btn {
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

.admin-content {
  flex: 1;
  padding: var(--space-l);
  background: var(--c-primary);
  color: var(--c-light);
}

.admin-content :slotted(h2) {
  font-size: 0.9rem;
}

@media (max-width: 40rem) {
  .admin-layout {
    flex-direction: column;
  }

  .admin-sidebar {
    width: 100%;
    height: auto;
    flex-direction: row;
    align-items: center;
    padding: var(--space-m);
    border-right: none;
    border-bottom: 1px solid hsla(0, 0%, 100%, 0.1);
  }

  .admin-sidebar__title,
  .admin-sidebar__divider {
    display: none;
  }

  .admin-sidebar__nav {
    flex-direction: row;
    gap: var(--space-xs);
    overflow-x: auto;
  }

  .admin-sidebar__link {
    padding: var(--space-s);
  }

  .admin-sidebar__link span {
    display: none;
  }

  .admin-sidebar__footer {
    flex-direction: row;
    align-items: center;
    width: auto;
    flex-shrink: 0;
    margin: 0 0 0 auto;
    padding-top: 0;
    border-top: none;
  }

  .admin-sidebar__email {
    display: none;
  }

  .admin-sidebar__footer-actions {
    padding: 0;
  }
}
</style>
