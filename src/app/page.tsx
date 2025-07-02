'use client'

import { useState, useEffect, FormEvent } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, Loader2, Moon, Sun, Book, Scale, ExternalLink, AlertCircle, X, Eye } from 'lucide-react'

interface SearchEntry {
  text: string;
  lineNumber: number;
  paragraph?: string;
  canon?: string;
}

interface SearchResult {
  text: string;
  document: 'catecismo' | 'direito_canonico';
  lineNumber: number;
  paragraph?: string;
  canon?: string;
  context: {
    before: string[];
    after: string[];
  };
}

interface SearchResponse {
  searchTerm: string;
  results: SearchResult[];
  totalMatches: number;
  availableDocuments: {
    catecismo: boolean;
    direito_canonico: boolean;
  };
}

interface DocumentData {
  catecismo: SearchEntry[];
  direito_canonico: SearchEntry[];
}

interface DocumentMetadata {
  catecismo: {
    total: number;
    lastParagraph: number;
  };
  direito_canonico: {
    total: number;
    lastCanon: number;
  };
}

export default function Home() {
  const [searchTerm, setSearchTerm] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [searchResponse, setSearchResponse] = useState<SearchResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [documentsData, setDocumentsData] = useState<DocumentData | null>(null)
  const [metadata, setMetadata] = useState<DocumentMetadata | null>(null)
  const [isLoadingData, setIsLoadingData] = useState(true)

  // Estado para modal de íntegra
  const [showIntegralModal, setShowIntegralModal] = useState(false)
  const [integralContent, setIntegralContent] = useState<{
    title: string;
    content: string[];
    type: 'paragraph' | 'canon';
    number: string;
    matchCount?: number;
    currentMatch?: number;
  } | null>(null)
  const [isLoadingIntegral, setIsLoadingIntegral] = useState(false)

  // Carregar dados dos documentos
  useEffect(() => {
    const loadDocuments = async () => {
      try {
        setIsLoadingData(true)
        console.log('🔄 Carregando dados dos documentos...')
        
        // Carrega metadados primeiro
        const metadataResponse = await fetch('/data/search-metadata.json')
        if (!metadataResponse.ok) {
          throw new Error('Erro ao carregar metadados')
        }
        const metadataData = await metadataResponse.json()
        setMetadata(metadataData)
        
        // Carrega dados do catecismo
        const catecismoResponse = await fetch('/data/catecismo-search.json')
        if (!catecismoResponse.ok) {
          throw new Error('Erro ao carregar dados do catecismo')
        }
        const catecismoData = await catecismoResponse.json()
        
        // Carrega dados do direito canônico  
        const direitoResponse = await fetch('/data/direito-search.json')
        if (!direitoResponse.ok) {
          throw new Error('Erro ao carregar dados do direito canônico')
        }
        const direitoData = await direitoResponse.json()
        
        const documentsData = {
          catecismo: catecismoData.entries || [],
          direito_canonico: direitoData.entries || []
        }
        
        setDocumentsData(documentsData)
        
        console.log('✅ Documentos carregados com sucesso:', {
          catecismo: documentsData.catecismo.length + ' entradas',
          direito_canonico: documentsData.direito_canonico.length + ' entradas',
          metadata: metadataData
        })
        
      } catch (error) {
        console.error('❌ Erro ao carregar documentos:', error)
        setError('Erro ao carregar documentos. Usando dados básicos...')
        
        // Fallback com dados básicos
        const fallbackData = {
          catecismo: [
            { text: "1. O desejo de Deus está inscrito no coração do homem, porque o homem foi criado por Deus e para Deus; e Deus não cessa de atrair o homem a si, e somente em Deus o homem encontrará a verdade e a felicidade que não cessa de procurar.", lineNumber: 1, paragraph: "1" },
            { text: "2. «Fala, porque o teu servo escuta» (1Sm 3,10). A Igreja, seguindo o exemplo dos apóstolos, nunca cessou de proclamar a todos que Jesus Cristo, Filho de Deus feito homem, é «o Caminho, a Verdade e a Vida» (Jo 14,6).", lineNumber: 2, paragraph: "2" },
            { text: "3. Aqueles que com a ajuda de Deus acolheram o apelo de Cristo e a ele livremente responderam foram, por sua vez, levados pelo amor de Cristo a anunciar por toda a parte a Boa Nova.", lineNumber: 3, paragraph: "3" }
          ],
          direito_canonico: [
            { text: "Cân. 1 - As normas do presente Código referem-se apenas à Igreja latina.", lineNumber: 1, canon: "1" },
            { text: "Cân. 2 - Na maior parte, o Código não define os ritos que devem ser observados na celebração das ações litúrgicas; por isso as leis litúrgicas até agora vigentes conservam a sua força.", lineNumber: 2, canon: "2" },
            { text: "Cân. 3 - Os cânones do Código não ab-rogam nem derrogam as convenções que a Sé Apostólica celebrou com as nações.", lineNumber: 3, canon: "3" }
          ]
        }
        setDocumentsData(fallbackData)
        setMetadata({
          catecismo: { total: 3, lastParagraph: 3 },
          direito_canonico: { total: 3, lastCanon: 3 }
        })
      } finally {
        setIsLoadingData(false)
      }
    }

    loadDocuments()
  }, [])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    
    if (!searchTerm.trim() || searchTerm.trim().length < 2) {
      setError('Digite pelo menos 2 caracteres para buscar')
      return
    }

    if (!documentsData) {
      setError('Documentos ainda não foram carregados. Tente novamente.')
      return
    }

    setError('')
    setIsLoading(true)
    setResults([])
    setSearchResponse(null)

    try {
      const results: SearchResult[] = []
      const searchRegex = new RegExp(searchTerm.trim(), 'gi')

      console.log(`🔍 Buscando por: "${searchTerm.trim()}"`)

      // Buscar no catecismo
      documentsData.catecismo.forEach((entry: SearchEntry, index: number) => {
        if (searchRegex.test(entry.text)) {
          // Pega mais contexto (2-3 linhas antes e depois)
          const beforeLines = documentsData.catecismo
            .slice(Math.max(0, index - 3), index)
            .map(e => e.text)
            .filter(text => text.length > 20); // Filtra linhas muito curtas
          
          const afterLines = documentsData.catecismo
            .slice(index + 1, Math.min(documentsData.catecismo.length, index + 4))
            .map(e => e.text)
            .filter(text => text.length > 20); // Filtra linhas muito curtas
            
          results.push({
            text: entry.text,
            document: 'catecismo',
            lineNumber: entry.lineNumber,
            paragraph: entry.paragraph,
            context: {
              before: beforeLines,
              after: afterLines
            }
          })
        }
      })

      // Buscar no direito canônico
      documentsData.direito_canonico.forEach((entry: SearchEntry, index: number) => {
        if (searchRegex.test(entry.text)) {
          // Pega mais contexto (2-3 linhas antes e depois)
          const beforeLines = documentsData.direito_canonico
            .slice(Math.max(0, index - 3), index)
            .map(e => e.text)
            .filter(text => text.length > 20); // Filtra linhas muito curtas
          
          const afterLines = documentsData.direito_canonico
            .slice(index + 1, Math.min(documentsData.direito_canonico.length, index + 4))
            .map(e => e.text)
            .filter(text => text.length > 20); // Filtra linhas muito curtas
            
          results.push({
            text: entry.text,
            document: 'direito_canonico',
            lineNumber: entry.lineNumber,
            canon: entry.canon,
            context: {
              before: beforeLines,
              after: afterLines
            }
          })
        }
      })

      const response: SearchResponse = {
        searchTerm: searchTerm.trim(),
        results,
        totalMatches: results.length,
        availableDocuments: {
          catecismo: results.some(r => r.document === 'catecismo'),
          direito_canonico: results.some(r => r.document === 'direito_canonico')
        }
      }

      setResults(results)
      setSearchResponse(response)
      
      console.log(`✅ Busca concluída: ${results.length} resultados encontrados`)
    } catch (error) {
      console.error('❌ Erro na busca:', error)
      setError('Erro ao realizar a busca. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  const isDarkMode = theme === 'dark'

  const highlightText = (text: string, searchTerm: string) => {
    if (!searchTerm) return text
    
    const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
    const parts = text.split(regex)
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className={`px-2 py-1 rounded font-semibold shadow-sm ${
          isDarkMode 
            ? 'bg-yellow-400 text-gray-900 border border-yellow-500/30' 
            : 'bg-yellow-200 text-gray-900'
        }`}>
          {part}
        </mark>
      ) : part
    )
  }

  // Calcula estatísticas por documento
  const getDocumentStats = () => {
    if (!searchResponse) return { catecismo: 0, direito_canonico: 0 }
    
    const catecismoCount = results.filter(r => r.document === 'catecismo').length
    const direitoCanonicoCount = results.filter(r => r.document === 'direito_canonico').length
    
    return { catecismo: catecismoCount, direito_canonico: direitoCanonicoCount }
  }

  const documentStats = getDocumentStats()

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'dark' ? 'light' : 'dark')
  }

  // Função para buscar íntegra do parágrafo ou cânon
  const showIntegral = async (type: 'paragraph' | 'canon', number: string) => {
    if (!documentsData) return
    
    setIsLoadingIntegral(true)
    setShowIntegralModal(true)
    
    try {
      const data = type === 'paragraph' ? documentsData.catecismo : documentsData.direito_canonico
      
      // Busca todas as entradas do parágrafo/cânon específico
      const entries = data.filter(entry => {
        if (type === 'paragraph') {
          return entry.paragraph === number
        } else {
          return entry.canon === number
        }
      })
      
      if (entries.length > 0) {
        const title = type === 'paragraph' 
          ? `Parágrafo ${number} - Catecismo da Igreja Católica`
          : `Cânon ${number} - Código de Direito Canônico`
        
        const content = entries.map(entry => entry.text)
        
        // Conta ocorrências da palavra pesquisada se houver termo de busca
        let matchCount = 0
        if (searchTerm && searchTerm.trim()) {
          const searchRegex = new RegExp(searchTerm.trim(), 'gi')
          content.forEach(text => {
            const matches = text.match(searchRegex)
            if (matches) {
              matchCount += matches.length
            }
          })
        }
        
        setIntegralContent({
          title: matchCount > 0 ? `${title} (${matchCount} ocorrência${matchCount !== 1 ? 's' : ''} de "${searchTerm}")` : title,
          content,
          type,
          number,
          matchCount
        })
      } else {
        setIntegralContent({
          title: type === 'paragraph' ? `Parágrafo ${number}` : `Cânon ${number}`,
          content: ['Conteúdo não encontrado.'],
          type,
          number
        })
      }
    } catch (error) {
      console.error('Erro ao buscar íntegra:', error)
      setIntegralContent({
        title: 'Erro',
        content: ['Erro ao carregar o conteúdo.'],
        type,
        number
      })
    } finally {
      setIsLoadingIntegral(false)
    }
  }

  if (isLoadingData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600 text-lg font-medium">Carregando documentos da Igreja...</p>
          <p className="text-gray-500 text-sm mt-2">Aguarde, carregando dados completos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen transition-all duration-500 ${
      isDarkMode 
        ? 'bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 text-gray-100' 
        : 'bg-gradient-to-br from-blue-50 to-indigo-100 text-gray-900'
    }`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-6 sm:mb-8 relative">
            {/* Botão de tema no canto superior direito */}
            <div className="absolute top-0 right-0 z-10">
              <button
                type="button"
                onClick={toggleTheme}
                className={`inline-flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-300 border-2 ${
                  isDarkMode 
                    ? 'bg-slate-800 text-gray-100 border-slate-600 hover:bg-slate-700 hover:border-slate-500 shadow-lg' 
                    : 'bg-white text-gray-900 border-gray-300 hover:bg-gray-50 hover:border-gray-400 shadow-md'
                }`}
                title={`Alternar para tema ${isDarkMode ? 'claro' : 'escuro'}`}
              >
                {isDarkMode ? (
                  <>
                    <Sun className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">Claro</span>
                  </>
                ) : (
                  <>
                    <Moon className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">Escuro</span>
                  </>
                )}
              </button>
            </div>
            
            <h1 className={`text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4 transition-colors duration-300 px-12 sm:px-0 ${
              isDarkMode ? 'text-gray-50 drop-shadow-lg' : 'text-gray-900'
            }`}>
              Consulta nos Documentos da Igreja
            </h1>
            <p className={`text-sm sm:text-base lg:text-lg mb-4 sm:mb-6 transition-colors duration-300 ${
              isDarkMode ? 'text-gray-300 drop-shadow' : 'text-gray-600'
            }`}>
              Busque no Catecismo da Igreja Católica e no Código de Direito Canônico
            </p>
            
            {/* Links para documentos originais */}
            <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
              {/* Links oficiais do Vaticano */}
              <div className="text-center">
                <p className={`text-xs sm:text-sm mb-2 sm:mb-3 font-medium transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>Links oficiais do Vaticano:</p>
                <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-4">
                  <a 
                    href="https://www.vatican.va/archive/ccc/index_po.htm" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-xs sm:text-sm font-medium"
                  >
                    <Book className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                    <span className="truncate">Catecismo - Site Oficial</span>
                    <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                  </a>
                  <a 
                    href="https://www.vatican.va/archive/cod-iuris-canonici/portuguese/codex-iuris-canonici_po.pdf" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 bg-purple-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors text-xs sm:text-sm font-medium"
                  >
                    <Scale className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                    <span className="truncate">Direito Canônico - PDF Oficial</span>
                    <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Search Form */}
          <Card className={`mb-6 sm:mb-8 transition-colors duration-300 ${
            isDarkMode ? 'bg-slate-800/90 border-slate-600 shadow-xl backdrop-blur-sm' : 'bg-white border-gray-200'
          }`}>
            <CardContent className="p-4 sm:p-6">
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <div className="flex-1">
                  <Input
                    type="text"
                    placeholder="Digite sua busca (mín. 2 caracteres)... Ex: Deus, Jesus, matrimônio, oração"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`w-full transition-colors duration-300 text-base ${
                      isDarkMode 
                        ? 'bg-slate-700 border-slate-500 text-gray-100 placeholder-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                  />
                </div>
                <Button 
                  type="submit" 
                  disabled={isLoading || searchTerm.trim().length < 2}
                  className={`transition-colors duration-300 shadow-lg w-full sm:w-auto min-h-[44px] ${
                    isDarkMode 
                      ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/25' 
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Search className="h-4 w-4 mr-2" />
                  )}
                  Buscar
                </Button>
              </form>
              {error && !isLoadingData && (
                <p className={`mt-3 text-sm font-medium ${
                  isDarkMode ? 'text-red-300 bg-red-900/20 px-3 py-2 rounded border border-red-800/30' : 'text-red-600'
                }`}>{error}</p>
              )}
            </CardContent>
          </Card>

          {/* Results Summary */}
          {searchResponse && results.length > 0 && (
            <Card className={`mb-4 sm:mb-6 transition-colors duration-300 ${
              isDarkMode 
                ? 'bg-gradient-to-r from-slate-800/90 to-slate-700/90 border-slate-600 shadow-xl backdrop-blur-sm' 
                : 'bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200'
            }`}>
              <CardContent className="p-4 sm:p-6">
                <div className="text-center">
                    <h2 className={`text-lg sm:text-xl lg:text-2xl font-semibold mb-3 sm:mb-4 ${
                      isDarkMode ? 'text-gray-50' : 'text-gray-900'
                    }`}>
                      Resultados para &ldquo;{searchResponse.searchTerm}&rdquo;
                    </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                    {/* Total */}
                    <div className={`rounded-lg p-3 sm:p-4 shadow-sm transition-colors duration-300 ${
                      isDarkMode ? 'bg-slate-700/80 shadow-xl' : 'bg-white'
                    }`}>
                      <div className={`text-xl sm:text-2xl font-bold ${
                        isDarkMode ? 'text-gray-100' : 'text-gray-900'
                      }`}>{searchResponse.totalMatches}</div>
                      <div className={`text-xs sm:text-sm ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-600'
                      }`}>Total de resultados</div>
                    </div>
                    
                    {/* Catecismo */}
                    <div className={`rounded-lg p-3 sm:p-4 shadow-sm border transition-colors duration-300 ${
                      isDarkMode 
                        ? 'bg-blue-900/30 border-blue-700/50 shadow-xl' 
                        : 'bg-blue-50 border-blue-200'
                    }`}>
                      <div className="flex items-center justify-center gap-1 sm:gap-2 mb-1 sm:mb-2">
                        <Book className={`h-4 w-4 sm:h-5 sm:w-5 ${
                          isDarkMode ? 'text-blue-400' : 'text-blue-600'
                        }`} />
                        <span className={`font-medium text-sm sm:text-base ${
                          isDarkMode ? 'text-blue-300' : 'text-blue-800'
                        }`}>Catecismo</span>
                      </div>
                      <div className={`text-xl sm:text-2xl font-bold ${
                        isDarkMode ? 'text-blue-200' : 'text-blue-900'
                      }`}>{documentStats.catecismo}</div>
                      <div className={`text-xs sm:text-sm ${
                        isDarkMode ? 'text-blue-300' : 'text-blue-600'
                      }`}>
                        {documentStats.catecismo === 1 ? 'resultado' : 'resultados'}
                      </div>
                    </div>
                    
                    {/* Direito Canônico */}
                    <div className={`rounded-lg p-3 sm:p-4 shadow-sm border transition-colors duration-300 ${
                      isDarkMode 
                        ? 'bg-purple-900/30 border-purple-700/50 shadow-xl' 
                        : 'bg-purple-50 border-purple-200'
                    }`}>
                      <div className="flex items-center justify-center gap-1 sm:gap-2 mb-1 sm:mb-2">
                        <Scale className={`h-4 w-4 sm:h-5 sm:w-5 ${
                          isDarkMode ? 'text-purple-400' : 'text-purple-600'
                        }`} />
                        <span className={`font-medium text-sm sm:text-base ${
                          isDarkMode ? 'text-purple-300' : 'text-purple-800'
                        }`}>Direito Canônico</span>
                      </div>
                      <div className={`text-xl sm:text-2xl font-bold ${
                        isDarkMode ? 'text-purple-200' : 'text-purple-900'
                      }`}>{documentStats.direito_canonico}</div>
                      <div className={`text-xs sm:text-sm ${
                        isDarkMode ? 'text-purple-300' : 'text-purple-600'
                      }`}>
                        {documentStats.direito_canonico === 1 ? 'resultado' : 'resultados'}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Results */}
          {results.length > 0 && (
            <div className="space-y-3 sm:space-y-4">
              {results.slice(0, 50).map((result, index) => (
                <Card key={index} className={`overflow-hidden transition-colors duration-300 ${
                  isDarkMode ? 'bg-slate-800/90 border-slate-600 shadow-lg backdrop-blur-sm' : 'bg-white border-gray-200'
                }`}>
                  <CardHeader className="pb-2 sm:pb-3">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                      <div className="flex items-center gap-2">
                        {result.document === 'catecismo' ? (
                          <Book className={`h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 ${
                            isDarkMode ? 'text-blue-400' : 'text-blue-600'
                          }`} />
                        ) : (
                          <Scale className={`h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 ${
                            isDarkMode ? 'text-purple-400' : 'text-purple-600'
                          }`} />
                        )}
                        <span className={`text-sm sm:text-base lg:text-lg font-semibold ${
                          isDarkMode ? 'text-gray-100' : 'text-gray-900'
                        }`}>
                          {result.document === 'catecismo' ? 'Catecismo da Igreja Católica' : 'Código de Direito Canônico'}
                        </span>
                      </div>
                      
                      {/* Badge do parágrafo/cânon */}
                      <div className="flex flex-wrap gap-2">
                        {result.document === 'catecismo' && result.paragraph && (
                          <button
                            onClick={() => showIntegral('paragraph', result.paragraph!)}
                            className={`group inline-flex items-center gap-1 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-bold transition-all duration-200 hover:scale-105 ${
                              isDarkMode 
                                ? 'bg-blue-900/60 text-blue-200 border border-blue-700/50 hover:bg-blue-800/80 hover:border-blue-600' 
                                : 'bg-blue-100 text-blue-800 hover:bg-blue-200 border border-blue-300'
                            }`}
                            title="Clique para ver a íntegra do parágrafo"
                          >
                            Parágrafo {result.paragraph}
                            <Eye className="h-3 w-3 opacity-60 group-hover:opacity-100 transition-opacity" />
                          </button>
                        )}
                        {result.document === 'direito_canonico' && result.canon && (
                          <button
                            onClick={() => showIntegral('canon', result.canon!)}
                            className={`group inline-flex items-center gap-1 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-bold transition-all duration-200 hover:scale-105 ${
                              isDarkMode 
                                ? 'bg-purple-900/60 text-purple-200 border border-purple-700/50 hover:bg-purple-800/80 hover:border-purple-600' 
                                : 'bg-purple-100 text-purple-800 hover:bg-purple-200 border border-purple-300'
                            }`}
                            title="Clique para ver a íntegra do cânon"
                          >
                            Cân. {result.canon}
                            <Eye className="h-3 w-3 opacity-60 group-hover:opacity-100 transition-opacity" />
                          </button>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      {/* Contexto anterior */}
                      {result.context.before && result.context.before.length > 0 && (
                        <div className={`p-3 rounded-lg border-l-4 ${
                          isDarkMode 
                            ? 'bg-slate-700/50 border-l-gray-500 text-gray-300' 
                            : 'bg-gray-50 border-l-gray-300 text-gray-600'
                        }`}>
                          <div className="text-xs font-medium mb-1 opacity-75">Contexto anterior:</div>
                          <div className="text-sm">
                            {result.context.before.map((line, idx) => (
                              <p key={idx} className="mb-1">{line}</p>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Texto principal com destaque */}
                      <p className={`leading-relaxed text-sm sm:text-base p-3 rounded-lg border-l-4 ${
                        result.document === 'catecismo'
                          ? (isDarkMode 
                              ? 'bg-blue-900/30 border-l-blue-400 text-blue-100' 
                              : 'bg-blue-50 border-l-blue-500 text-blue-900'
                            )
                          : (isDarkMode 
                              ? 'bg-purple-900/30 border-l-purple-400 text-purple-100' 
                              : 'bg-purple-50 border-l-purple-500 text-purple-900'
                            )
                      }`}>
                        <span className="font-medium text-xs opacity-75 block mb-2">
                          {result.document === 'catecismo' ? 'Catecismo' : 'Direito Canônico'}:
                        </span>
                        {highlightText(result.text, searchTerm)}
                      </p>
                      
                      {/* Contexto posterior */}
                      {result.context.after && result.context.after.length > 0 && (
                        <div className={`p-3 rounded-lg border-l-4 ${
                          isDarkMode 
                            ? 'bg-slate-700/50 border-l-gray-500 text-gray-300' 
                            : 'bg-gray-50 border-l-gray-300 text-gray-600'
                        }`}>
                          <div className="text-xs font-medium mb-1 opacity-75">Contexto posterior:</div>
                          <div className="text-sm">
                            {result.context.after.map((line, idx) => (
                              <p key={idx} className="mb-1">{line}</p>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {results.length > 50 && (
                <Card className={`transition-colors duration-300 ${
                  isDarkMode ? 'bg-slate-800/90 border-slate-600 shadow-lg backdrop-blur-sm' : 'bg-white border-gray-200'
                }`}>
                  <CardContent className="p-4 text-center">
                    <p className={`text-sm ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      Mostrando primeiros 50 resultados de {results.length} encontrados.
                      <br />
                      <span className="text-xs">Refine sua busca para resultados mais específicos.</span>
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {results.length === 0 && !isLoading && searchTerm && searchResponse && (
            <Card className={`transition-colors duration-300 ${
              isDarkMode ? 'bg-slate-800/90 border-slate-600 shadow-lg backdrop-blur-sm' : 'bg-white border-gray-200'
            }`}>
              <CardContent className="p-6 text-center">
                <p className={`text-base ${
                  isDarkMode ? 'text-gray-200' : 'text-gray-600'
                }`}>
                  Nenhum resultado encontrado para &ldquo;{searchTerm}&rdquo;
                </p>
                <p className={`text-sm mt-2 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Tente usar palavras diferentes ou verifique a ortografia
                </p>
                <div className={`mt-4 text-xs ${
                  isDarkMode ? 'text-gray-500' : 'text-gray-400'
                }`}>
                  <p>Sugestões: "Deus", "Jesus", "Igreja", "amor", "fé", "sacramento", "matrimônio", "batismo"</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Modal de Íntegra */}
      {showIntegralModal && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowIntegralModal(false)
            }
          }}
        >
          <div className={`w-full max-w-4xl max-h-[85vh] rounded-lg shadow-2xl transition-colors duration-300 ${
            isDarkMode ? 'bg-slate-800 border-slate-600' : 'bg-white border-gray-200'
          } border overflow-hidden flex flex-col`}>
            {/* Header do Modal */}
            <div className={`flex-shrink-0 flex items-center justify-between p-4 sm:p-6 border-b transition-colors duration-300 ${
              isDarkMode ? 'border-slate-600 bg-slate-700/50' : 'border-gray-200 bg-gray-50'
            }`}>
              <div className="flex items-center gap-3 flex-1">
                {integralContent?.type === 'paragraph' ? (
                  <Book className={`h-5 w-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                ) : (
                  <Scale className={`h-5 w-5 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                )}
                <h3 className={`text-lg sm:text-xl font-semibold ${
                  isDarkMode ? 'text-gray-100' : 'text-gray-900'
                }`}>
                  {isLoadingIntegral ? 'Carregando...' : integralContent?.title}
                </h3>
              </div>
              
              {/* Indicador de busca quando há ocorrências */}
              {integralContent?.matchCount && integralContent.matchCount > 0 && searchTerm && (
                <div className={`hidden sm:flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${
                  isDarkMode ? 'bg-yellow-900/40 text-yellow-300 border border-yellow-700/50' : 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                }`}>
                  <span>"{searchTerm}" destacado</span>
                </div>
              )}
              
              <button
                onClick={() => setShowIntegralModal(false)}
                className={`p-2 rounded-lg transition-colors duration-200 ${
                  isDarkMode 
                    ? 'hover:bg-slate-600 text-gray-300 hover:text-gray-100' 
                    : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
                }`}
                title="Fechar"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Conteúdo do Modal */}
            <div className="overflow-y-auto flex-1 p-4 sm:p-6 min-h-0">
              {isLoadingIntegral ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className={`h-8 w-8 animate-spin ${
                    isDarkMode ? 'text-blue-400' : 'text-blue-600'
                  }`} />
                </div>
              ) : (
                <div className="space-y-4">
                  {integralContent?.content.map((paragraph, index) => (
                    <p key={index} className={`leading-relaxed text-sm sm:text-base ${
                      isDarkMode ? 'text-gray-200' : 'text-gray-800'
                    }`}>
                      {searchTerm ? highlightText(paragraph, searchTerm) : paragraph}
                    </p>
                  ))}
                  
                  {integralContent && integralContent.content.length === 0 && (
                    <p className={`text-center py-8 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      Nenhum conteúdo encontrado.
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Footer do Modal */}
            <div className={`flex-shrink-0 flex items-center justify-between p-4 sm:p-6 border-t transition-colors duration-300 ${
              isDarkMode ? 'border-slate-600 bg-slate-700/50' : 'border-gray-200 bg-gray-50'
            }`}>
              <div className={`text-xs sm:text-sm ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                <div>
                  {integralContent?.type === 'paragraph' 
                    ? 'Catecismo da Igreja Católica' 
                    : 'Código de Direito Canônico'
                  }
                </div>
                {integralContent?.matchCount && integralContent.matchCount > 0 && searchTerm && (
                  <div className={`mt-1 text-xs ${
                    isDarkMode ? 'text-yellow-300' : 'text-yellow-700'
                  }`}>
                    {integralContent.matchCount} ocorrência{integralContent.matchCount !== 1 ? 's' : ''} de "{searchTerm}" destacada{integralContent.matchCount !== 1 ? 's' : ''}
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowIntegralModal(false)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                    isDarkMode 
                      ? 'bg-slate-600 text-gray-200 hover:bg-slate-500' 
                      : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                  }`}
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 