/**
 * Divide o regulamento em seções para processamento mais eficiente
 * @param {Object} document - Documento original contendo o regulamento
 * @returns {Array} - Array de seções com título e conteúdo
 */
export const processRegulamento = (document) => {
  // Array para armazenar as seções
  const sections = [];
  // Conteúdo do documento
  const content = document.content;
  
  // Padrões para identificar títulos de seções e artigos
  const sectionPatterns = [
    // Padrão para títulos de capítulos: "1. Do Glossário", "2. Do Objeto", etc.
    /(\d+\.\s+[^\n]+)\n/g,
    // Padrão para títulos de seções: "Seção I - Do Benefício de Aposentadoria", etc.
    /(Seção\s+[IVX]+\s+[–-]\s+[^\n]+)\n/g,
    // Padrão para artigos: "Art. 20 -", etc.
    /(Art\.\s+\d+\s+[–-])/g
  ];
  
  // Para armazenar todas as correspondências encontradas com sua posição
  let allMatches = [];
  
  // Encontrar todas as correspondências para cada padrão
  sectionPatterns.forEach(pattern => {
    let match;
    // Resetar o índice de pesquisa para cada padrão
    pattern.lastIndex = 0;
    
    while ((match = pattern.exec(content)) !== null) {
      allMatches.push({
        title: match[1],
        index: match.index,
        type: pattern.toString() // Para identificar o tipo de padrão
      });
    }
  });
  
  // Ordenar todas as correspondências por posição no texto
  allMatches.sort((a, b) => a.index - b.index);
  
  // Criar seções baseadas nas correspondências encontradas
  for (let i = 0; i < allMatches.length; i++) {
    const currentMatch = allMatches[i];
    const nextMatch = allMatches[i + 1];
    
    // Determinar o conteúdo da seção atual
    const sectionContent = nextMatch 
      ? content.substring(currentMatch.index, nextMatch.index)
      : content.substring(currentMatch.index);
    
    sections.push({
      title: currentMatch.title.trim(),
      content: sectionContent.trim(),
      type: currentMatch.type
    });
  }
  
  // Se não encontrar nenhuma seção, considerar o documento inteiro como uma seção
  if (sections.length === 0) {
    sections.push({
      title: document.name,
      content: content,
      type: "document"
    });
  }
  
  return sections;
};

/**
 * Encontra as seções mais relevantes para a pergunta do usuário
 * @param {Array} sections - Array de seções do documento
 * @param {String} question - Pergunta do usuário
 * @returns {Array} - Seções mais relevantes para a pergunta
 */
export const findRelevantSections = (sections, question) => {
  // Palavras-chave específicas para cada categoria de pergunta
  const keywords = {
    "aposentadoria": ["aposentadoria", "benefício de aposentadoria", "elegibilidade", "requisitos", "idade", "tempo", "mínima", "vínculo", "término"],
    "benefício de risco": ["benefício de risco", "auxílio-doença", "invalidez", "pensão por morte", "auxílio funeral", "acidente", "doença"],
    "contribuições": ["contribuição", "contribuição normal", "contribuição adicional", "contribuição coletiva", "percentual", "patrocinador"],
    "institutos": ["autopatrocínio", "benefício proporcional diferido", "portabilidade", "resgate", "término do vínculo"],
    "pagamentos": ["pagamento", "forma", "renda", "mensal", "vitalícia", "prazo", "percentual", "único"]
  };
  
  // Palavras a serem ignoradas na análise (preposições, artigos, etc.)
  const stopWords = ['de', 'a', 'o', 'que', 'e', 'do', 'da', 'em', 'um', 'para', 'é', 'com', 'não', 'uma', 'os', 'no', 'se', 'na', 'por', 'mais', 'as', 'dos', 'como', 'mas', 'foi', 'ao', 'ele', 'das', 'tem', 'à', 'seu', 'sua', 'ou', 'ser', 'quando', 'muito', 'há', 'nos', 'já', 'está', 'eu', 'também', 'só', 'pelo', 'pela', 'até', 'isso', 'ela', 'entre', 'era', 'depois', 'sem', 'mesmo', 'aos', 'ter', 'seus', 'quem', 'nas', 'me', 'esse', 'eles', 'estão', 'você', 'tinha', 'foram', 'essa', 'num', 'nem', 'suas', 'meu', 'às', 'minha', 'têm', 'numa', 'pelos', 'elas', 'havia', 'seja', 'qual', 'será', 'nós', 'tenho', 'lhe', 'deles', 'essas', 'esses', 'pelas', 'este', 'fosse', 'dele', 'tu', 'te', 'vocês', 'vos', 'lhes', 'meus', 'minhas', 'teu', 'tua', 'teus', 'tuas', 'nosso', 'nossa', 'nossos', 'nossas', 'dela', 'delas', 'esta', 'estes', 'estas', 'aquele', 'aquela', 'aqueles', 'aquelas', 'isto', 'aquilo', 'estou', 'está', 'estamos', 'estão', 'estive', 'esteve', 'estivemos', 'estiveram', 'estava', 'estávamos', 'estavam', 'estivera', 'estivéramos', 'esteja', 'estejamos', 'estejam', 'estivesse', 'estivéssemos', 'estivessem', 'estiver', 'estivermos', 'estiverem'];
  
  // Extrair palavras-chave da pergunta do usuário
  const questionWords = question.toLowerCase()
    .replace(/[.,;?!:()]/g, '')
    .split(' ')
    .filter(word => word.length > 2 && !stopWords.includes(word));
  
  // Identificar categorias relevantes baseadas na pergunta
  let relevantKeywords = [];
  
  // Verificar se a pergunta contém palavras-chave de categorias específicas
  for (const [category, categoryKeywords] of Object.entries(keywords)) {
    if (categoryKeywords.some(keyword => 
        question.toLowerCase().includes(keyword.toLowerCase()))) {
      relevantKeywords = [...relevantKeywords, ...categoryKeywords];
    }
  }
  
  // Se nenhuma categoria específica for identificada, usar as palavras da pergunta
  if (relevantKeywords.length === 0) {
    relevantKeywords = questionWords;
  }
  
  // Calcular pontuação para cada seção baseada nas palavras-chave
  const scoredSections = sections.map(section => {
    let score = 0;
    const sectionText = (section.title + ' ' + section.content).toLowerCase();
    
    // Ponderar seções por tipo (dar mais peso para artigos específicos)
    const typeWeight = section.type && section.type.includes("Art") ? 1.5 : 1.0;
    
    // Pontuar por palavras-chave da categoria
    relevantKeywords.forEach(keyword => {
      const regex = new RegExp('\\b' + keyword + '\\b', 'gi');
      const matches = sectionText.match(regex);
      if (matches) {
        score += matches.length * 2 * typeWeight;
      }
    });
    
    // Pontuar por palavras da pergunta
    questionWords.forEach(word => {
      const regex = new RegExp('\\b' + word + '\\b', 'gi');
      const matches = sectionText.match(regex);
      if (matches) {
        score += matches.length * typeWeight;
      }
    });
    
    // Dar pontuação extra para seções com palavras exatas da pergunta no título
    questionWords.forEach(word => {
      if (section.title.toLowerCase().includes(word)) {
        score += 3 * typeWeight;
      }
    });
    
    return { ...section, score };
  });
  
  // Ordenar seções pela pontuação (mais relevantes primeiro)
  scoredSections.sort((a, b) => b.score - a.score);
  
  // Selecionar as seções mais relevantes (até 5 seções)
  const topSections = scoredSections
    .filter(s => s.score > 0)
    .slice(0, 5);
  
  // Se não encontrar seções relevantes, retornar uma mensagem
  if (topSections.length === 0) {
    return [{
      title: "Informação não encontrada",
      content: "Não foi possível identificar seções específicas no regulamento que respondam a esta pergunta."
    }];
  }
  
  return topSections;
};