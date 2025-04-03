const fs = require('fs');
const path = require('path');
const postcss = require('postcss');
const tailwindcss = require('tailwindcss');
const autoprefixer = require('autoprefixer');

// Lê o arquivo globals.css
const css = fs.readFileSync(path.resolve(__dirname, './app/globals.css'), 'utf8');

// Processa o CSS com PostCSS, TailwindCSS e Autoprefixer
postcss([
  tailwindcss(require('./tailwind.config.js')),
  autoprefixer,
])
  .process(css, { from: './app/globals.css', to: './app/output.css' })
  .then(result => {
    // Cria o diretório se não existir
    const outputDir = path.resolve(__dirname, './public/css');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Escreve o CSS processado no arquivo de saída
    fs.writeFileSync(path.resolve(outputDir, 'tailwind.css'), result.css);
    
    console.log('Tailwind CSS gerado com sucesso em /public/css/tailwind.css');
  })
  .catch(error => {
    console.error('Erro ao gerar Tailwind CSS:', error);
  }); 