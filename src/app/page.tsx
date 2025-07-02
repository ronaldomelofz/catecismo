'use client'

import { useState, useEffect, FormEvent } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, Loader2, Moon, Sun, Book, Scale, ExternalLink, Download } from 'lucide-react'

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
  catecismo: string[];
  direito_canonico: string[];
}

export default function Home() {
  const [searchTerm, setSearchTerm] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [searchResponse, setSearchResponse] = useState<SearchResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [documentsData, setDocumentsData] = useState<DocumentData | null>(null)
  const [isLoadingData, setIsLoadingData] = useState(true)

  // Carregar dados dos documentos
  useEffect(() => {
    const loadDocuments = async () => {
      try {
        setIsLoadingData(true)
        
        // Carrega dados do catecismo
        const catecismoResponse = await fetch('/data/catecismo.json')
        const catecismoData = await catecismoResponse.json()
        
        // Carrega dados do direito canônico  
        const direitoResponse = await fetch('/data/direito_canonico.json')
        const direitoData = await direitoResponse.json()
        
        // Extrai o texto dos objetos JSON
        const catecismoTexts = catecismoData.content.map((item: any) => item.text)
        const direitoTexts = direitoData.content.map((item: any) => item.text)
        
        setDocumentsData({
          catecismo: catecismoTexts,
          direito_canonico: direitoTexts
        })
        
        console.log('Documentos carregados:', {
          catecismo: catecismoTexts.length + ' entradas',
          direito_canonico: direitoTexts.length + ' entradas'
        })
      } catch (error) {
        console.error('Erro ao carregar documentos:', error)
        // Fallback para dados básicos se JSON não funcionar
        const fallbackData = {
          catecismo: [
            "1. O desejo de Deus está inscrito no coração do homem, porque o homem foi criado por Deus e para Deus; e Deus não cessa de atrair o homem a si, e somente em Deus o homem encontrará a verdade e a felicidade que não cessa de procurar.",
            "2. «Fala, porque o teu servo escuta» (1Sm 3,10). A Igreja, seguindo o exemplo dos apóstolos, nunca cessou de proclamar a todos que Jesus Cristo, Filho de Deus feito homem, é «o Caminho, a Verdade e a Vida» (Jo 14,6).",
            "3. Aqueles que com a ajuda de Deus acolheram o apelo de Cristo e a ele livremente responderam foram, por sua vez, levados pelo amor de Cristo a anunciar por toda a parte a Boa Nova."
          ],
          direito_canonico: [
            "Cân. 1 - As normas do presente Código referem-se apenas à Igreja latina.",
            "Cân. 2 - Na maior parte, o Código não define os ritos que devem ser observados na celebração das ações litúrgicas; por isso as leis litúrgicas até agora vigentes conservam a sua força.",
            "Cân. 3 - Os cânones do Código não ab-rogam nem derrogam as convenções que a Sé Apostólica celebrou com as nações."
          ]
        }
        setDocumentsData(fallbackData)
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

      // Buscar no catecismo
      documentsData.catecismo.forEach((text: string, index: number) => {
        if (searchRegex.test(text)) {
          const paragraphMatch = text.match(/^(\d+)\./)
          results.push({
            text,
            document: 'catecismo',
            lineNumber: index + 1,
            paragraph: paragraphMatch ? paragraphMatch[1] : undefined,
            context: {
              before: documentsData.catecismo.slice(Math.max(0, index - 1), index),
              after: documentsData.catecismo.slice(index + 1, index + 2)
            }
          })
        }
      })

      // Buscar no direito canônico
      documentsData.direito_canonico.forEach((text: string, index: number) => {
        if (searchRegex.test(text)) {
          const canonMatch = text.match(/Cân\.\s*(\d+)/)
          results.push({
            text,
            document: 'direito_canonico',
            lineNumber: index + 1,
            canon: canonMatch ? canonMatch[1] : undefined,
            context: {
              before: documentsData.direito_canonico.slice(Math.max(0, index - 1), index),
              after: documentsData.direito_canonico.slice(index + 1, index + 2)
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
      
      console.log(`Busca realizada: "${searchTerm}" - ${results.length} resultados`)
    } catch (error) {
      console.error('Erro na busca:', error)
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

  if (isLoadingData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Carregando documentos da Igreja...</p>
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
            
            {/* Status dos documentos carregados */}
            {documentsData && (
              <div className={`text-xs sm:text-sm mb-4 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                📚 {documentsData.catecismo.length} parágrafos do Catecismo • {documentsData.direito_canonico.length} cânones carregados
              </div>
            )}
            
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
                    placeholder="Digite sua busca (mín. 2 caracteres)..."
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
              {error && (
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
              {results.map((result, index) => (
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
                          <span className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-bold transition-colors ${
                            isDarkMode 
                              ? 'bg-blue-900/60 text-blue-200 border border-blue-700/50' 
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            Parágrafo {result.paragraph}
                          </span>
                        )}
                        {result.document === 'direito_canonico' && result.canon && (
                          <span className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-bold transition-colors ${
                            isDarkMode 
                              ? 'bg-purple-900/60 text-purple-200 border border-purple-700/50' 
                              : 'bg-purple-100 text-purple-800'
                          }`}>
                            Cân. {result.canon}
                          </span>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      <p className={`leading-relaxed text-sm sm:text-base ${
                        isDarkMode ? 'text-gray-100' : 'text-gray-800'
                      }`}>
                        {highlightText(result.text, searchTerm)}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
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
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
} 