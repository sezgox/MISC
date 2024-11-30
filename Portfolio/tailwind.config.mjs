/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		extend: {
			colors: {
				primary: {
				  DEFAULT: '#01A592',
				  light: '#56BABD'
				},
				secondary : {
					DEFAULT: '#B2D1EB'
				  }
			  }
			  
		},
		screens: {
			sm: '640px', 
			md: '768px', 
			lg: '1024px',
			xl: '1600px', 
		  },
	},
	plugins: [
		
	],
}
