export function ThemeScript() {
  const themeScript = `
    (function() {
      function getThemePreference() {
        try {
          const stored = localStorage.getItem('rental-app-theme');
          if (stored && (stored === 'dark' || stored === 'light' || stored === 'system')) {
            return stored;
          }
        } catch (e) {
          // localStorage might not be available
        }
        return 'system';
      }

      function applyTheme(theme) {
        const root = document.documentElement;
        root.classList.remove('light', 'dark');
        
        if (theme === 'system') {
          const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
          root.classList.add(systemTheme);
        } else {
          root.classList.add(theme);
        }
      }

      try {
        const theme = getThemePreference();
        applyTheme(theme);
      } catch (e) {
        // Fallback to light theme
        document.documentElement.classList.add('light');
      }
    })();
  `

  return (
    <script
      dangerouslySetInnerHTML={{
        __html: themeScript,
      }}
    />
  )
}
