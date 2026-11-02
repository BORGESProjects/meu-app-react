import fs from 'node:fs/promises'
import path from 'node:path'
import zlib from 'node:zlib'
export const raizesAtuais=['tmp/revisao-profissional/revisao-semantica-v40/acervo-extraido','tmp/revisao-profissional/revisao-semantica-v39/acervo-extraido','tmp/revisao-profissional/revisao-semantica-v38/acervo-extraido','tmp/revisao-profissional/revisao-semantica-v37/acervo-extraido','tmp/revisao-profissional/revisao-semantica-v36/acervo-extraido','tmp/revisao-profissional/revisao-semantica-v35/acervo-extraido','tmp/revisao-profissional/revisao-semantica-v34/acervo-extraido','tmp/revisao-profissional/revisao-semantica-v33/acervo-extraido','tmp/revisao-profissional/revisao-semantica-v32/acervo-extraido','tmp/revisao-profissional/revisao-semantica-v31/acervo-extraido','tmp/revisao-profissional/revisao-semantica-v30/acervo-extraido','tmp/revisao-profissional/revisao-semantica-v29/acervo-extraido','tmp/revisao-profissional/revisao-semantica-v28/acervo-extraido','tmp/revisao-profissional/revisao-semantica-v27/acervo-extraido','tmp/revisao-profissional/revisao-semantica-v26/acervo-extraido','tmp/revisao-profissional/revisao-semantica-v25/acervo-extraido','tmp/revisao-profissional/revisao-semantica-v24/acervo-extraido','tmp/revisao-profissional/revisao-semantica-v23/acervo-extraido','tmp/revisao-profissional/revisao-semantica-v22/acervo-extraido','tmp/revisao-profissional/revisao-semantica-v21/acervo-extraido','tmp/revisao-profissional/revisao-semantica-v20/acervo-extraido','tmp/revisao-profissional/revisao-semantica-v19/acervo-extraido','tmp/revisao-profissional/revisao-semantica-v18/acervo-extraido','tmp/revisao-profissional/revisao-semantica-v17/acervo-extraido','tmp/revisao-profissional/revisao-semantica-v16/acervo-extraido','tmp/revisao-profissional/revisao-semantica-v15/acervo-extraido','tmp/revisao-profissional/revisao-semantica-v14/acervo-extraido','tmp/revisao-profissional/revisao-semantica-v13/acervo-extraido','tmp/revisao-profissional/revisao-semantica-v12/acervo-extraido','tmp/revisao-profissional/revisao-semantica-v11/acervo-extraido','tmp/revisao-profissional/revisao-semantica-v10/acervo-extraido','tmp/revisao-profissional/revisao-semantica-v9/acervo-extraido','tmp/revisao-profissional/revisao-semantica-v8/acervo-extraido','tmp/revisao-profissional/revisao-semantica-v7/acervo-extraido','tmp/revisao-profissional/revisao-semantica-v6/acervo-extraido','tmp/revisao-profissional/revisao-semantica-v5/acervo-extraido','tmp/revisao-profissional/revisao-semantica-v4/acervo-extraido','tmp/revisao-profissional/revisao-semantica-v1/acervo-extraido','tmp/revisao-profissional/revisao-justificativas-v2/acervo-extraido','tmp/revisao-profissional/revisao-saeb-v1/acervo-extraido','tmp/revisao-profissional/revisao-blocos-v2/acervo-extraido','tmp/revisao-profissional/revisao-objetos-v2/acervo-extraido','tmp/revisao-profissional/revisao-comandos/acervo-extraido','tmp/revisao-profissional/revisao-dirigida/acervo-extraido','tmp/revisao-profissional/acervo-extraido']
raizesAtuais.unshift('tmp/revisao-profissional/revisao-semantica-v41/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-semantica-v42/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-semantica-v43/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-semantica-v44/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-semantica-v45/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-semantica-v46/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-semantica-v47/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-semantica-v48/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-semantica-v49/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-semantica-v50/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-semantica-v51/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-semantica-v52/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-semantica-v53/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-semantica-v54/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-semantica-v55/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-semantica-v56/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-semantica-v57/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-semantica-v58/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-semantica-v59/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-semantica-v60/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-saeb-questionarios-v61/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-saeb-1990-v62/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-saeb-2009-portugues-v63/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-saeb-2009-portugues-3a-v64/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-pf-2021-agente-v65/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-stj-enfermagem-v66/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-mpce-servico-social-v67/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-bcb-economia-v68/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-codevasf-jornalismo-v69/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-petrobras-economia-v70/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-stj-juridica-v71/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-tjam-arquivologia-v72/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-alprev-servico-social-v73/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-irbr-ingles-politica-internacional-v74/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-dpdf-servico-social-v75/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-codevasf-civil-v76/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-dpdf-engenharia-civil-v77/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-tjpa-jornalismo-v78/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-enem-reaplicacao-ppl-2024-v79/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-mpce-servico-social-2020-v80/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-pires-rio-servico-social-v81/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-funpresp-auditoria-investimentos-v82/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-abin-eletronica-2018-v83/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-seepe-assistente-social-v84/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-trf6-servico-social-v85/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-ansa-engenharia-civil-v86/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-icmbio-administracao-v87/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-inss-ledor-conteudos-v88/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-mpto-servico-social-v89/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-fub-refrigeracao-v90/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-fub-agronomia-v91/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-fub-civil-v92/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-fub-medicina-v93/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-fub-administracao-arquivo-v94/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-fub-libras-v95/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-fub-ti-basicos-v96/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-abin-educacao-v97/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-hub-terapia-ocupacional-v98/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-hub-terapia-ocupacional-2018-v99/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-hub-terapia-ocupacional-caderno-completo-v100/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-hub-psicologia-v101/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-hub-nutricao-v102/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-hub-farmacia-v103/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-hub-cirurgia-geral-v104/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-hub-psicologia-2018-v105/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-hub-odontologia-2018-v106/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-hub-farmacia-2018-v107/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-hub-saude-coletiva-2018-v108/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-hub-nutricao-2018-v109/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-hub-fisioterapia-2017-v110/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-pgm-fortaleza-procurador-2017-v111/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-mpsc-promotor-2021-v112/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-anac-especialista-2024-v113/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-anac-curso-formacao-v114/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-mpsc-promotor-2023-p1-v115/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-antt-cargo1-2024-v117/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-banese-tecnico-2021-v118/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-enem-2024-dia1-laranja-v119/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-fnde-formacao-2024-v120/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-antt-cargo3-economia-2024-v121/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/corrigir-antt-cargo3-formulas-v122/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-pcse-delegado-formacao-2020-v123/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-enem-2025-dia1-caderno9-v124/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-hub-enfermagem-2017-v125/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-fub-musico-2023-v126/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-hub-servico-social-2018-v127/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-mme-administrador-2023-v128/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-abin-area10-2018-v129/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-abin-area10-contexto-v130/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-pmal-soldado-2017-v131/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-emap-enfermagem-2018-v132/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-hub-servico-social-2020-v133/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-anatel-especialista-2025-v134/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-codevasf-publicidade-2024-v135/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-ebserh-jornalista-2018-v136/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-ebserh-assistente-social-2018-v137/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-polcal-perito-medico-legista-2023-v138/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-ebserh-fisica-medica-radioterapia-2018-v139/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-pcdf-agente-cfp-2023-v140/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-excecoes-pcdf-ebserh-v141/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-ansa-eletrica-2026-v142/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-arsal-direito-2026-v143/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-infrasa-administrador-2026-v144/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-saeb-matematica-4a-2009-v145/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-hub-servico-social-2019-v146/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-cti-oral-respostas-2023-v147/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-telebras-engenharia-civil-2025-v148/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-stm-servico-social-2018-v149/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-sefaz-se-auditoria-2022-v150/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-sefaz-se-auditoria-2022-v151/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-sesau-assistente-social-2021-v152/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-pf-comunicacao-social-2025-v153/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-seduc-al-filosofia-2018-v154/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-petrobras-geologia-fisica-matematica-2022-v155/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-see-pe-educacao-fisica-2022-v156/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/adicao-see-pe-educacao-fisica-itens-omitidos-v157/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-dataprev-comunicacao-social-2023-v158/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-tbg-auditoria-compliance-2023-v159/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-mpto-fotografia-2024-v160/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-funpresp-jud-auditoria-2026-v161/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-fub-musico-2016-v162/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-slu-servico-social-2019-v163/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-see-pe-musica-2022-v164/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-anm-eletrica-2025-v165/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-camara-processo-legislativo-2026-v166/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-pf-fisica-forense-2025-v167/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-serpro-ciencia-dados-2021-v168/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-inss-formacao-3turma-2025-v169/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-enem-ppl-2017-dia1-v170/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-fuvest-2026-fase1-v171/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-ans-formacao-2025-v172/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-ans-formacao-caderno2-2025-v173/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-enem-2025-dia1-caderno9-v174/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-camara-2025-itens-91-180-v175/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-udesc-jornalista-2026-v176/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-depen-servico-social-2021-v177/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-polc-al-tecnico-forense-2022-v178/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-seduc-al-educacao-especial-2021-v179/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-seduc-recife-educacao-fisica-2023-v180/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-codevasf-economia-2024-v181/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-cti-renato-archer-infraestrutura-2024-v182/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-tbg-instrumentacao-eletrica-2023-v183/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-embrapa-operacao-maquinas-agricolas-2024-v184/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-inoversasul-professor-projeto-vida-2025-v185/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-mpo-conhecimentos-gerais-2024-v186/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-semed-aracaju-matematica-2024-v187/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-stj-analista-judiciario-2024-v188/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-fapeal-contabilidade-2026-v189/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-fub-fisica-2016-v190/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-seedf-enfermagem-2017-v191/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-seedf-sociologia-2017-v192/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-ebserh-economia-2018-v193/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-tcdf-auditor-2021-v194/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-polcal-papiloscopista-2023-v195/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-petrobras-instrumentacao-2024-v196/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-tbg-mecanica-gasoduto-2023-v197/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-trt10-comunicacao-social-2025-v198/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-trt10-enfermagem-trabalho-2025-v199/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-tcepa-enfermagem-2016-v200/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-sesau-al-endoscopia-2021-v201/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-cau-br-geotecnologia-2024-v202/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-cti-renato-archer-2024-v203/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-tcepa-economia-2016-v204/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-irbr-2026-economia-direito-v205/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-ebserh-gestao-hospitalar-2018-v206/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-pref-pires-do-rio-cargos-6-7-v207/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-telebras-advogado-2022-v208/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-anp-combustiveis-ii-2022-v209/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-tbg-inspecao-2023-v210/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-embrapa-manejo-animal-2025-v211/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-inoversasul-comunicacao-2025-v212/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-ebserh-terapia-intensiva-pediatrica-2018-v213/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-enem-linguagens-caderno9-2023-v214/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-slu-jornalismo-2019-v215/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-uneal-direito-2026-v216/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-petrobras-eletrica-2022-v217/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-anp-combustiveis-2022-v218/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-see-pe-historia-2022-v219/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-tjpa-economia-2025-v220/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-ebserh-necropsia-2018-v221/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-pf-perito-eletrica-2018-v222/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-dpdf-jornalismo-2020-v223/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-petrobras-edificacoes-2023-v224/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-fub-taxidermista-2016-v225/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-abin-agente-2018-v226/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-sesdf-psiquiatria-2016-v227/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-ebserh-enfermagem-cardiologia-2018-v228/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-emap-contratos-2018-v229/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-pgdf-comunicacao-2019-v230/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-sesaual-cirurgia-toracica-2021-v231/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-mpcsc-controle-publico-2022-v232/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-prf-curso-formacao-2021-v233/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-telebras-financas-2021-v234/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-fub-estatistico-2022-v235/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-formulas-fub-complemento-v236/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-inpi-biologia-2023-v237/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-seduc-recife-ingles-2023-v238/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-fub-biologo-2025-v239/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-pf-medicina-legal-2025-v240/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/reconciliacao-pf-medicina-legal-copia-portal-v241/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-pf-fisica-forense-2025-v242/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-arsal-engenharia-eletrica-2026-v243/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-enem-ppl2017-caderno21-v244/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-tcepa-arquitetura-2016-v245/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-cbmal-combatente-2017-v246/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-pf-farmacia-2018-v247/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-cnj-judiciaria-2024-v248/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-cpnuje-cargo7-engenharia-civil-2024-v249/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-insa-popularizacao-conhecimento-2024-v250/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-trt10-estatistica-2024-v251/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-stm-cargo9-policia-judicial-2025-v252/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-uneal-conhecimentos-basicos-cargo6-2026-v253/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-enem-ppl-2024-dia1-caderno1-v254/acervo-extraido')
export async function lerArquivoAtual(arquivo,raizes=raizesAtuais){
 for(const raiz of raizes){try{return await fs.readFile(path.join(raiz,arquivo))}catch(e){if(e.code!=='ENOENT')throw e}}
 throw Error('Arquivo não encontrado: '+arquivo)
}
async function indexarLotes(m,raizes){
 const desejados=new Set(m.lotes.map(x=>x.arquivo)),indice=new Map()
 for(const raiz of raizes){
  let nomes
  try{nomes=await fs.readdir(path.join(raiz,'lotes'))}catch(e){if(e.code==='ENOENT')continue;throw e}
  for(const nome of nomes){const relativo=`lotes/${nome}`;if(desejados.has(relativo)&&!indice.has(relativo))indice.set(relativo,path.join(raiz,relativo))}
  if(indice.size===desejados.size)break
 }
 const ausentes=[...desejados].filter(x=>!indice.has(x))
 if(ausentes.length)throw Error(`Lotes do manifesto não encontrados: ${ausentes.length}`)
 return indice
}
export async function* lotesAtuais(raizes=raizesAtuais){
 const m=JSON.parse(await lerArquivoAtual('manifesto.json',raizes))
 const indiceArquivos=await indexarLotes(m,raizes)
 for(const [indice,lote] of m.lotes.entries())yield {indice,lote,questoes:JSON.parse(zlib.gunzipSync(await fs.readFile(indiceArquivos.get(lote.arquivo))))}
}








raizesAtuais.unshift('tmp/revisao-profissional/revisao-cbmal-oficial-2017-v255/acervo-extraido')

raizesAtuais.unshift('tmp/revisao-profissional/complemento-gabaritos-cbmal-2017-v256/acervo-extraido')

raizesAtuais.unshift('tmp/revisao-profissional/revisao-enade-arquitetura-2005-v257/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-saeb-2009-portugues-8a-v258/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-tcepa-cargo39-2016-v259/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-ebserh-seguranca-trabalho-2018-v260/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-fub-audiovisual-2018-v261/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-tjdft-servidor-2015-pendencias-v262/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-fub-ti-2016-pendencias-v263/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/correcao-gabarito-fub-ti-2016-v264/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/consolidacao-fub-ti-2016-itens-79-88-v265/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/correcao-gabarito-fub-ti-item84-v266/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/reparacao-classificacao-fub-ti-item84-v267/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-dpdf-defensor-2019-pendencias-v268/acervo-extraido')

raizesAtuais.unshift('tmp/revisao-profissional/revisao-seec-df-auditor-2019-pendencias-v270/acervo-extraido')

raizesAtuais.unshift('tmp/revisao-profissional/revisao-seec-df-auditor-2019-pendencias-v271/acervo-extraido')

raizesAtuais.unshift('tmp/revisao-profissional/revisao-abin-oficial-inteligencia-area3-2018-pendencias-v272/acervo-extraido')

raizesAtuais.unshift('tmp/revisao-profissional/revisao-ses-df-residencia-medica-intensiva-2016-2-pendencias-v273/acervo-extraido')

raizesAtuais.unshift('tmp/revisao-profissional/revisao-stj-2018-analista-administrativo-pendencias-v274/acervo-extraido')

raizesAtuais.unshift('tmp/revisao-profissional/revisao-petrobras-2021-enfase-2-pendencias-v275/acervo-extraido')

raizesAtuais.unshift('tmp/revisao-profissional/correcao-petrobras-2021-item-58-v276/acervo-extraido')

raizesAtuais.unshift('tmp/revisao-profissional/revisao-petrobras-2021-geofisica-fisica-pendencias-v277/acervo-extraido')

raizesAtuais.unshift('tmp/revisao-profissional/gabarito-petrobras-geofisica-itens-111-113-v278/acervo-extraido')

raizesAtuais.unshift('tmp/revisao-profissional/correcao-leitura-petrobras-2021-item-58-v279/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-enem-reaplicacao-ppl-2024-d1-cd9-v281/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/correcao-enem-ppl-2024-cd9-item13-v282/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-pge-rj-2022-cargo3-direito-v283/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-secont-es-2022-cargo5-engenharia-v284/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-see-pe-sociologia-2022-disc13-v285/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-capes-2024-cargo1-administracao-v286/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-seduc-recife-2023-cargo9-matematica-v287/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-tbg-2023-cargo22-integridade-v288/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-insa-2025-cargo4-energia-v289/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-stj-2024-cargo17-psicologia-v290/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-fub-2025-cargo8-eletrica-v291/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-tjpa-2025-cargo12-engenharia-civil-v292/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-tjdft-2015-cargo14-enfermagem-v293/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-tcepa-2016-cargo17-servico-social-v294/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-abin-2018-cargo2-area8-v295/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-slu-2019-economia-v296/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-tcerj-2021-cargo2-v297/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-inpi-2024-cargo14-redes-v298/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-tcesc-2022-economia-v299/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-cnj-2024-engenharia-eletrica-v300/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-fnde-2024-arquitetura-v301/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-pref-cachoeiro-psicologia-2024-v302/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-trf6-2025-direito-cargo23-v303/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-enem-reaplicacao-ppl-2020-dia1-caderno4-v304/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-fub-2025-cargo19-contabilidade-v305/acervo-extraido')

raizesAtuais.unshift('tmp/revisao-profissional/revisao-susep-2025-cargo3-itens-51-130-v306/acervo-extraido')

raizesAtuais.unshift('tmp/revisao-profissional/revisao-stm-2025-cargo4-comunicacao-v307/acervo-extraido')

raizesAtuais.unshift('tmp/revisao-profissional/revisao-telebras-2025-cargo14-eletrica-v308/acervo-extraido')

raizesAtuais.unshift('tmp/revisao-profissional/revisao-alprev-2026-cargo6-economia-financas-v309/acervo-extraido')

raizesAtuais.unshift('tmp/revisao-profissional/revisao-ebserh-2018-cargo9-relacoes-publicas-v310/acervo-extraido')

raizesAtuais.unshift('tmp/revisao-profissional/revisao-fub-2018-cargo2-servico-social-v311/acervo-extraido')

raizesAtuais.unshift('tmp/revisao-profissional/revisao-slu-2019-cargo13-eletrica-v312/acervo-extraido')

raizesAtuais.unshift('tmp/revisao-profissional/revisao-slu-2019-cargo13-eletrica-v312/acervo-extraido')

raizesAtuais.unshift('tmp/revisao-profissional/revisao-telebras-2021-cargo16-itens51-88-v313/acervo-extraido')

raizesAtuais.unshift('tmp/revisao-profissional/revisao-petrobras-2023-enfase5-instrumentacao-itens41-100-v314/acervo-extraido')

raizesAtuais.unshift('tmp/revisao-profissional/revisao-petrobras-2023-enfase12-administracao-itens41-100-v315/acervo-extraido')

raizesAtuais.unshift('tmp/revisao-profissional/revisao-tjes-2023-cargo19-servico-social-itens51-90-v316/acervo-extraido')

raizesAtuais.unshift('tmp/revisao-profissional/revisao-anatel-2024-basicos-itens6-49-v317/acervo-extraido')

raizesAtuais.unshift('tmp/revisao-profissional/revisao-insa-cargo7-producao-animal-itens51-120-v318/acervo-extraido')

raizesAtuais.unshift('tmp/revisao-profissional/revisao-semed-aracaju-educacao-fisica-itens51-120-v319/acervo-extraido')

raizesAtuais.unshift('tmp/revisao-profissional/revisao-udesc-2026-cargo8-pedagogia-itens51-120-v320/acervo-extraido')

raizesAtuais.unshift('tmp/revisao-profissional/revisao-tcepa-2016-economia-itens51-120-v321/acervo-extraido')

raizesAtuais.unshift('tmp/revisao-profissional/revisao-enem-2023-humanas-caderno9-nvda-itens46-90-v322/acervo-extraido')

raizesAtuais.unshift('tmp/revisao-profissional/revisao-hub-2018-fisioterapia-itens-pendentes-v323/acervo-extraido')

raizesAtuais.unshift('tmp/revisao-profissional/revisao-tcdf-procurador-2020-direito-itens-162-199-v324/acervo-extraido')

raizesAtuais.unshift('tmp/revisao-profissional/revisao-saeb-2009-matematica-8serie-pendentes-v325/acervo-extraido')

raizesAtuais.unshift('tmp/revisao-profissional/revisao-petrobras-2021-engenharia-civil-pendentes-v326/acervo-extraido')

raizesAtuais.unshift('tmp/revisao-profissional/revisao-seduc-al-2021-sociologia-pendentes-v327/acervo-extraido')

raizesAtuais.unshift('tmp/revisao-profissional/revisao-pires-do-rio-2021-monitor-creche-pendentes-v328/acervo-extraido')

raizesAtuais.unshift('tmp/revisao-profissional/revisao-enem-2025-matematica-caderno11-pendentes-v329/acervo-extraido')

raizesAtuais.unshift('tmp/revisao-profissional/revisao-sao-cristovao-acs-2022-pendentes-v330/acervo-extraido')

raizesAtuais.unshift('tmp/revisao-profissional/revisao-sao-cristovao-ace-2022-pendentes-v331/acervo-extraido')

raizesAtuais.unshift('tmp/revisao-profissional/revisao-seduc-al-conhecimentos-gerais-v332/acervo-extraido')

raizesAtuais.unshift('tmp/revisao-profissional/revisao-anac-especialista-area2-2023-pendentes-v333/acervo-extraido')

raizesAtuais.unshift('tmp/revisao-profissional/revisao-cnmp-arquivologia-cargo2-2023-pendentes-v334/acervo-extraido')

raizesAtuais.unshift('tmp/revisao-profissional/revisao-sefin-fortaleza-2023-cargo1-administracao-publica-v335/acervo-extraido')

raizesAtuais.unshift('tmp/revisao-profissional/revisao-inoversasul-2024-professor-ingles-v336/acervo-extraido')

raizesAtuais.unshift('tmp/revisao-profissional/revisao-tce-rn-2025-cargo7-atuaria-auditoria-v337/acervo-extraido')

raizesAtuais.unshift('tmp/revisao-profissional/revisao-tce-rn-2025-cargo3-engenharia-civil-v338/acervo-extraido')

raizesAtuais.unshift('tmp/revisao-profissional/reclassificacao-alprev-2026-conhecimentos-basicos-v339/acervo-extraido')

raizesAtuais.unshift('tmp/revisao-profissional/revisao-pmma-2026-musica-v340/acervo-extraido')

raizesAtuais.unshift('tmp/revisao-profissional/revisao-uneal-servico-social-2026-v341/acervo-extraido')

raizesAtuais.unshift('tmp/revisao-profissional/revisao-enade-comunicacao-social-2009-v342/acervo-extraido')

raizesAtuais.unshift('tmp/revisao-profissional/revisao-seduc-al-fisica-2018-v343/acervo-extraido')

raizesAtuais.unshift('tmp/revisao-profissional/revisao-stj-psicologia-organizacional-2018-v344/acervo-extraido')

raizesAtuais.unshift('tmp/revisao-profissional/revisao-slu-df-2019-arquitetura-cargo2-v345/acervo-extraido')

raizesAtuais.unshift('tmp/revisao-profissional/revisao-dpdf-2022-arquivologia-cargo3-v346/acervo-extraido')

raizesAtuais.unshift('tmp/revisao-profissional/revisao-prf-curso-formacao-2022-v347/acervo-extraido')

raizesAtuais.unshift('tmp/revisao-profissional/revisao-sesau-al-2021-tecnico-laboratorio-cargo53-v348/acervo-extraido')

raizesAtuais.unshift('tmp/revisao-profissional/revisao-anp-2022-atividade9-fiscalizacao-abastecimento-v349/acervo-extraido')

raizesAtuais.unshift('tmp/revisao-profissional/revisao-fub-2022-quimico-cargo13-v350/acervo-extraido')

raizesAtuais.unshift('tmp/revisao-profissional/revisao-petrobras-2023-2-enfase4-caldeiraria-v351/acervo-extraido')

raizesAtuais.unshift('tmp/revisao-profissional/revisao-tse-cpnuje-2024-enfermagem-cargo6-v352/acervo-extraido')

raizesAtuais.unshift('tmp/revisao-profissional/revisao-petrobras-rh-2023-2-instrumentacao-v353/acervo-extraido')

raizesAtuais.unshift('tmp/revisao-profissional/revisao-cebraspe-seduc-recife-2023-artes-cargo2-v354/acervo-extraido')

raizesAtuais.unshift('tmp/revisao-profissional/revisao-cebraspe-sefin-fortaleza-2023-psicologia-cargo8-v355/acervo-extraido')

raizesAtuais.unshift('tmp/revisao-profissional/revisao-cebraspe-anm-2025-cargo16-economia-contabilidade-v356/acervo-extraido')

raizesAtuais.unshift('tmp/revisao-profissional/revisao-cebraspe-funpresp-exe-2025-cargo5-investimentos-v358/acervo-extraido')

raizesAtuais.unshift('tmp/revisao-profissional/revisao-enem-2024-libras-caderno10-item73-v359/acervo-extraido')

raizesAtuais.unshift('tmp/revisao-profissional/revisao-enem-2024-libras-caderno10-item10-v360/acervo-extraido')

raizesAtuais.unshift('tmp/revisao-profissional/revisao-enem-2024-libras-caderno10-item9-v361/acervo-extraido')

raizesAtuais.unshift('tmp/revisao-profissional/revisao-enem-2024-libras-caderno10-itens7-12-13-16-v362/acervo-extraido')

raizesAtuais.unshift('tmp/revisao-profissional/revisao-enem-2024-libras-caderno10-itens17-22-v363/acervo-extraido')

raizesAtuais.unshift('tmp/revisao-profissional/revisao-enem-2024-libras-caderno10-itens28-29-31-32-v364/acervo-extraido')

raizesAtuais.unshift('tmp/revisao-profissional/revisao-enem-2024-libras-caderno10-itens23-26-v365/acervo-extraido')

raizesAtuais.unshift('tmp/revisao-profissional/revisao-enem-2024-libras-caderno10-itens33-34-36-37-v366/acervo-extraido')

raizesAtuais.unshift('tmp/revisao-profissional/revisao-enem-2024-libras-caderno10-itens38-41-v367/acervo-extraido')

raizesAtuais.unshift('tmp/revisao-profissional/revisao-enem-2024-libras-caderno10-itens42-45-v368/acervo-extraido')

raizesAtuais.unshift('tmp/revisao-profissional/revisao-enem-2024-libras-caderno10-itens46-48-v369/acervo-extraido')

raizesAtuais.unshift('tmp/revisao-profissional/revisao-enem-2024-libras-caderno10-itens50-53-v370/acervo-extraido')

raizesAtuais.unshift('tmp/revisao-profissional/revisao-enem-2024-libras-caderno10-itens54-58-v371/acervo-extraido')

raizesAtuais.unshift('tmp/revisao-profissional/revisao-enem-2024-libras-caderno10-itens60-63-v372/acervo-extraido')

raizesAtuais.unshift('tmp/revisao-profissional/revisao-enem-2024-libras-caderno10-itens64-66-v373/acervo-extraido')

raizesAtuais.unshift('tmp/revisao-profissional/revisao-enem-2024-libras-caderno10-itens68-71-v374/acervo-extraido')

raizesAtuais.unshift('tmp/revisao-profissional/revisao-enem-2024-libras-caderno10-itens72-75-v375/acervo-extraido')

raizesAtuais.unshift('tmp/revisao-profissional/revisao-enem-2024-libras-caderno10-itens78-82-v376/acervo-extraido')

raizesAtuais.unshift('tmp/revisao-profissional/revisao-enem-2024-libras-caderno10-itens83-87-v377/acervo-extraido')

raizesAtuais.unshift('tmp/revisao-profissional/revisao-enem-2024-libras-caderno10-itens88-90-v378/acervo-extraido')

raizesAtuais.unshift('tmp/revisao-profissional/revisao-enem-2024-libras-caderno10-itens-abertura-v379/acervo-extraido')

raizesAtuais.unshift('tmp/revisao-profissional/revisao-enem-2024-libras-caderno10-itens3-5-v380/acervo-extraido')

raizesAtuais.unshift('tmp/revisao-profissional/revisao-enem-2024-libras-caderno10-itens6-30-v381/acervo-extraido')

raizesAtuais.unshift('tmp/revisao-profissional/revisao-inoversasul-2024-cargo2-itens44-100-v382/acervo-extraido')

raizesAtuais.unshift('tmp/revisao-profissional/revisao-abin-2018-cargo2-area5-itens61-150-v383/acervo-extraido')

raizesAtuais.unshift('tmp/revisao-profissional/revisao-me-2020-perfil1-itens2-120-v384/acervo-extraido')

raizesAtuais.unshift('tmp/revisao-profissional/revisao-boa-vista-guarda-2024-formacao-itens1-80-v385/acervo-extraido')

raizesAtuais.unshift('tmp/revisao-profissional/revisao-inoversasul-2024-geografia-cargo16-itens41-100-v386/acervo-extraido')

raizesAtuais.unshift('tmp/revisao-profissional/revisao-mpo-2024-cargo7-itens52-100-v387/acervo-extraido')

raizesAtuais.unshift('tmp/revisao-profissional/revisao-cachoeiro-2024-assistente-social-itens61-100-v388/acervo-extraido')

raizesAtuais.unshift('tmp/revisao-profissional/revisao-trf6-2024-agente-policia-judicial-itens51-120-v389/acervo-extraido')

raizesAtuais.unshift('tmp/revisao-profissional/revisao-funpresp-jud-2026-publicidade-emprego5-pendencias-v390/acervo-extraido')

raizesAtuais.unshift('tmp/revisao-profissional/revisao-seduc-al-2018-portugues-cargo11-pendencias-v391/acervo-extraido')

raizesAtuais.unshift('tmp/revisao-profissional/revisao-ebserh-2018-psicologo-neuropsicologia-cargo47-v392/acervo-extraido')

raizesAtuais.unshift('tmp/revisao-profissional/revisao-fub-2018-engenharia-eletrica-cargo5-pendencias-v393/acervo-extraido')

raizesAtuais.unshift('tmp/revisao-profissional/revisao-cdcadf-df-2019-conselheiro-tutelar-pendencias-v394/acervo-extraido')

raizesAtuais.unshift('tmp/revisao-profissional/revisao-slu-2019-engenharia-producao-cargo11-pendencias-v395/acervo-extraido')

raizesAtuais.unshift('tmp/revisao-profissional/revisao-tjam-2019-analista-sistemas-pendencias-v396/acervo-extraido')

raizesAtuais.unshift('tmp/revisao-profissional/revisao-tjam-2019-biblioteconomia-pendencias-v397/acervo-extraido')

raizesAtuais.unshift('tmp/revisao-profissional/revisao-codevasf-2021-geologia-cargo12-pendencias-v398/acervo-extraido')

raizesAtuais.unshift('tmp/revisao-profissional/revisao-anm-2021-tecnico-seguranca-barragens-pendencias-v399/acervo-extraido')

raizesAtuais.unshift('tmp/revisao-profissional/revisao-cbmal-2021-soldado-cargo2-pendencias-v400/acervo-extraido')

raizesAtuais.unshift('tmp/revisao-profissional/revisao-funpresp-exe-2022-tecnologia-pendencias-v401/acervo-extraido')

raizesAtuais.unshift('tmp/revisao-profissional/revisao-petrobras-2022-enfase3-transporte-maritimo-pendencias-v402/acervo-extraido')

raizesAtuais.unshift('tmp/revisao-profissional/revisao-telebras-2022-estatistica-pendencias-v403/acervo-extraido')

raizesAtuais.unshift('tmp/revisao-profissional/revisao-inpi-2023-conhecimentos-basicos-pendencias-v404/acervo-extraido')

raizesAtuais.unshift('tmp/revisao-profissional/revisao-petrobras-2023-enfase8-fisica-pendencias-v405/acervo-extraido')

raizesAtuais.unshift('tmp/revisao-profissional/revisao-petrobras-2023-enfase9-eletrica-pendencias-v406/acervo-extraido')

raizesAtuais.unshift('tmp/revisao-profissional/revisao-boa-vista-2023-formacao-guarda-itens-v407/acervo-extraido')

raizesAtuais.unshift('tmp/revisao-profissional/revisao-depen-2021-cargo1-enfermagem-pendencias-v408/acervo-extraido')

raizesAtuais.unshift('tmp/revisao-profissional/revisao-hub-unb-rmulti-2020-enfermagem-pendencias-v409/acervo-extraido')

raizesAtuais.unshift('tmp/revisao-profissional/revisao-ans-curso-formacao-2025-pendencias-v410/acervo-extraido')

raizesAtuais.unshift('tmp/revisao-profissional/revisao-prf-cfp-segunda-prova-2022-pendencias-v411/acervo-extraido')

raizesAtuais.unshift('tmp/revisao-profissional/revisao-tbg-2023-tecnico-seguranca-pendencias-v412/acervo-extraido')

raizesAtuais.unshift('tmp/revisao-profissional/revisao-camara-maceio-analista-legislativo-2024-pendencias-v413/acervo-extraido')

raizesAtuais.unshift('tmp/revisao-profissional/revisao-embrapa-2025-biologia-sintetica-omics-pendencias-v414/acervo-extraido')

raizesAtuais.unshift('tmp/revisao-profissional/revisao-ansa-seguranca-trabalho-2026-v415/acervo-extraido')

raizesAtuais.unshift('tmp/revisao-profissional/revisao-cau-mg-arquiteto-2025-v416/acervo-extraido')

raizesAtuais.unshift('tmp/revisao-profissional/revisao-ibama-fauna-2025-v417/acervo-extraido')

raizesAtuais.unshift('tmp/revisao-profissional/revisao-tcern-arquivologia-2026-v418/acervo-extraido')

raizesAtuais.unshift('tmp/revisao-profissional/revisao-fuvest-2025-v419/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-fub-mineracao-2016-v420/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-cti-saude-avancada-2024-v421/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-prf-cfp-2019-v422/acervo-extraido')


raizesAtuais.unshift('tmp/revisao-profissional/revisao-stj-odontopediatria-2018-v423/acervo-extraido')

raizesAtuais.unshift('tmp/revisao-profissional/revisao-tcepa-webdesign-2016-v424/acervo-extraido')

raizesAtuais.unshift('tmp/revisao-profissional/revisao-emap-juridica-geral-2018-v425/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-embrapa-biologia-sintetica-omics-2025-v426/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-antt-engenharia-transportes-2024-v427/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-hub-cirurgia-residencia-2020-v428/acervo-extraido')

raizesAtuais.unshift('tmp/revisao-profissional/revisao-enem-2024-caderno10-ampliada-lote-v429/acervo-extraido')

raizesAtuais.unshift('tmp/revisao-profissional/vincular-gabarito-enem-caderno10-lote-v430/acervo-extraido')

raizesAtuais.unshift('tmp/revisao-profissional/revisao-enem-2025-caderno11-laranja-lote-v431/acervo-extraido')

raizesAtuais.unshift('tmp/revisao-profissional/classificar-seedf-portugues-2017-lote-v432/acervo-extraido')

raizesAtuais.unshift('tmp/revisao-profissional/revisar-seedf-basicos-cargo26-lote-v433/acervo-extraido')

raizesAtuais.unshift('tmp/revisao-profissional/revisar-tjdft-pediatria-2015-lote-v434/acervo-extraido')

raizesAtuais.unshift('tmp/revisao-profissional/revisar-seedf-japones-2017-lote-v435/acervo-extraido')

raizesAtuais.unshift('tmp/revisao-profissional/revisar-tcepa-administracao-2016-lote-v436/acervo-extraido')

raizesAtuais.unshift('tmp/revisao-profissional/revisar-bnb-2018-analista-bancario-pendencias-v437/acervo-extraido')

raizesAtuais.unshift('tmp/revisao-profissional/revisao-enem-2020-primeiro-dia-caderno4-rosa-lote-v438/acervo-extraido')

raizesAtuais.unshift('tmp/revisao-profissional/revisao-anatel-formacao-2026-lote-v439/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-cbmal-2021-lote-v440/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-tjam-engenharia-civil-2019-lote-v441/acervo-extraido')

raizesAtuais.unshift('tmp/revisao-profissional/revisao-me-arquivologia-2020-lote-v442/acervo-extraido')

raizesAtuais.unshift('tmp/revisao-profissional/revisao-inpi-eletronica-2023-lote-v443/acervo-extraido')

raizesAtuais.unshift('tmp/revisao-profissional/revisao-abin-matematica-estatistica-2018-lote-v444/acervo-extraido')

raizesAtuais.unshift('tmp/revisao-profissional/revisao-enem-2024-2a-aplicacao-linguagens-humanas-lote-v445/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-enem-2024-regular-linguagens-humanas-lote-v446/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-tbg-2023-engenharia-civil-lote-v447/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-prf-2019-policial-rodoviario-lote-v448/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-insa-popularizacao-ciencia-2025-lote-v449/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-antaq-cpnu-terceira-etapa-2025-lote-v450/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-pf-papiloscopista-2018-lote-v451/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-stj-enfermagem-2018-lote-v452/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-sefaz-al-auditor-2021-cargo-1-lote-v453/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-antt-curso-formacao-regulacao-transportes-2025-lote-v454/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-fnde-curso-formacao-2-turma-2025-lote-v455/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-insa-ciencia-alimentos-cargo2-2025-lote-v456/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-insa-solos-mineralogia-cargo9-2025-lote-v457/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-cau-br-jornalista-2024-lote-v458/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-cti-renato-archer-cargo4-nanotecnologia-fotonica-energia-2024-lote-v459/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-cti-renato-archer-industria4-python-ia-dados-cargo12-2024-lote-v460/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-udesc-2026-engenheiro-mecanico-cargo5-lote-v461/acervo-extraido')

raizesAtuais.unshift('tmp/revisao-profissional/revisao-enem-2024-dia2-caderno11-laranja-v462/acervo-extraido')

raizesAtuais.unshift('tmp/revisao-profissional/revisao-petrobras-2021-enfase19-seguranca-processo-v463/acervo-extraido')

raizesAtuais.unshift('tmp/revisao-profissional/revisao-enem-2025-belem-dia2-caderno11-laranja-v464/acervo-extraido')

raizesAtuais.unshift('tmp/revisao-profissional/revisao-seduc-al-ciencias-cargo3-2018-lote-v466/acervo-extraido')

raizesAtuais.unshift('tmp/revisao-profissional/revisao-dataprev-2023-tecnico-seguranca-cargo25-v467/acervo-extraido')

raizesAtuais.unshift('tmp/revisao-profissional/revisao-petrobras-2021-engenharia-civil-itens-51-86-v468/acervo-extraido')

raizesAtuais.unshift('tmp/revisao-profissional/revisao-sesau-al-2021-cirurgia-pediatrica-cargo15-v469/acervo-extraido')

raizesAtuais.unshift('tmp/revisao-profissional/revisao-anp-2022-atividade6-regulacao-v470/acervo-extraido')

raizesAtuais.unshift('tmp/revisao-profissional/revisao-tbg-2023-analista-gestao-cargo5-v471/acervo-extraido')

raizesAtuais.unshift('tmp/revisao-profissional/revisao-embrapa-2025-tecnico-seguranca-trabalho-v472/acervo-extraido')

raizesAtuais.unshift('tmp/revisao-profissional/revisao-inoversasul-2025-professor-musica-cargo23-v473/acervo-extraido')

raizesAtuais.unshift('tmp/revisao-profissional/revisao-codevasf-2024-analista-geologia-cargo8-v474/acervo-extraido')

raizesAtuais.unshift('tmp/revisao-profissional/revisao-pf-2025-perito-antropologia-cargo13-v475/acervo-extraido')

raizesAtuais.unshift('tmp/revisao-profissional/revisao-fapeal-2026-economia-cargo3-v476/acervo-extraido')

raizesAtuais.unshift('tmp/revisao-profissional/revisao-saeb-1997-biologia-v477/acervo-extraido')

raizesAtuais.unshift('tmp/revisao-profissional/revisao-insa-inovacao-cargo15-v478/acervo-extraido')

raizesAtuais.unshift('tmp/revisao-profissional/revisao-tcers-2025-arquitetura-cargo1-v479/acervo-extraido')

raizesAtuais.unshift('tmp/revisao-profissional/revisao-sefin-fortaleza-2023-cargo6-engenharia-civil-v480/acervo-extraido')

raizesAtuais.unshift('tmp/revisao-profissional/revisao-fub-2022-farmaceutico-cargo8-v481/acervo-extraido')

raizesAtuais.unshift('tmp/revisao-profissional/revisao-mpgo-2024-analista-ambiental-agronomia-cargo1-v482/acervo-extraido')

raizesAtuais.unshift('tmp/revisao-profissional/revisao-abin-2018-oficial-inteligencia-area2-economia-v483/acervo-extraido')

raizesAtuais.unshift('tmp/revisao-profissional/revisao-seduc-al-2021-professor-geografia-cargo10-v484/acervo-extraido')

raizesAtuais.unshift('tmp/revisao-profissional/revisao-seduc-al-2021-professor-filosofia-cargo8-v485/acervo-extraido')

raizesAtuais.unshift('tmp/revisao-profissional/revisao-seduc-al-2021-professor-historia-cargo11-v486/acervo-extraido')

raizesAtuais.unshift('tmp/revisao-profissional/revisao-anp-2022-atividade6-regulacao-novas-atribuicoes-iii-v487/acervo-extraido')

raizesAtuais.unshift('tmp/revisao-profissional/revisao-enem-2023-matematica-caderno11-laranja-v488/acervo-extraido')

raizesAtuais.unshift('tmp/revisao-profissional/revisao-fub-2016-tecnico-mecanica-cargo16-v489/acervo-extraido')

raizesAtuais.unshift('tmp/revisao-profissional/revisao-sesdf-2016-residencia-multiprofissional-servico-social-v490/acervo-extraido')

raizesAtuais.unshift('tmp/revisao-profissional/revisao-seduc-al-2018-educacao-fisica-cargo4-v491/acervo-extraido')

raizesAtuais.unshift('tmp/revisao-profissional/revisao-seduc-al-2018-sociologia-cargo13-v492/acervo-extraido')

raizesAtuais.unshift('tmp/revisao-profissional/revisao-seduc-al-2018-artes-cargo1-v493/acervo-extraido')

raizesAtuais.unshift('tmp/revisao-profissional/revisao-seduc-al-2018-biologia-cargo2-v494/acervo-extraido')

raizesAtuais.unshift('tmp/revisao-profissional/revisao-insa-bioeconomia-v495/acervo-extraido')

raizesAtuais.unshift('tmp/revisao-profissional/revisao-ana-2024-especialidade2-v496/acervo-extraido')

raizesAtuais.unshift('tmp/revisao-profissional/revisao-hub-transplante-rim-v497/acervo-extraido')

raizesAtuais.unshift('tmp/revisao-profissional/correcao-hub-transplante-rim-item48-v498/acervo-extraido')

raizesAtuais.unshift('tmp/revisao-profissional/revisao-cnj-arquitetura-2024-v499/acervo-extraido')

raizesAtuais.unshift('tmp/revisao-profissional/revisao-sesau-al-radiologia-2021-v500/acervo-extraido')

raizesAtuais.unshift('tmp/revisao-profissional/revisao-pf-engenharia-civil-2025-v501/acervo-extraido')

raizesAtuais.unshift('tmp/revisao-profissional/revisao-pref-sao-cristovao-professor-2019-v502/acervo-extraido')

raizesAtuais.unshift('tmp/revisao-profissional/revisao-slu-df-eng-ambiental-2019-v503/acervo-extraido')

raizesAtuais.unshift('tmp/revisao-profissional/revisao-fub-radiologia-2020-v504/acervo-extraido')

raizesAtuais.unshift('tmp/revisao-profissional/revisao-ana-curso-formacao-2024-v505/acervo-extraido')

raizesAtuais.unshift('tmp/revisao-profissional/revisao-fub-museologia-2016-v506/acervo-extraido')

raizesAtuais.unshift('tmp/revisao-profissional/revisao-pf-perito-civil-2018-v507/acervo-extraido')

raizesAtuais.unshift('tmp/revisao-profissional/revisao-see-pe-fonoaudiologia-2022-v508/acervo-extraido')

raizesAtuais.unshift('tmp/revisao-profissional/revisao-mpce-arquitetura-urbanismo-2025-v509/acervo-extraido')

raizesAtuais.unshift('tmp/revisao-profissional/revisao-mpto-arquitetura-urbanismo-2024-v510/acervo-extraido')

raizesAtuais.unshift('tmp/revisao-profissional/revisao-ana-especialista-economia-2024-v511/acervo-extraido')

raizesAtuais.unshift('tmp/revisao-profissional/revisao-sefin-fortaleza-geografia-2023-v512/acervo-extraido')

raizesAtuais.unshift('tmp/revisao-profissional/revisao-dpdf-psicologia-2020-v513/acervo-extraido')

raizesAtuais.unshift('tmp/revisao-profissional/revisao-sesau-al-farmaceutico-2021-v514/acervo-extraido')

raizesAtuais.unshift('tmp/revisao-profissional/revisao-seduc-al-professor-ingles-2021-v515/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-dataprev-medico-trabalho-2023-v516/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-pf-2025-geologia-forense-v517/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-tbg-2023-gasoduto-construcao-montagem-v518/acervo-extraido')

raizesAtuais.unshift('tmp/revisao-profissional/revisao-dpe-rs-defensor-2022-v519/acervo-extraido')

raizesAtuais.unshift('tmp/revisao-profissional/revisao-stj-2024-engenharia-mecanica-v520/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-telebras-2021-aeroespacial-v521/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-telebras-cargo11-duplicatas-antigas-v522/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-slu-df-2019-engenharia-mecanica-cargo14-v523/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-depen-cargo8-agente-federal-execucao-penal-v524/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-fub-2016-terapia-ocupacional-cargo7-v525/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-semed-aracaju-2024-professor-ingles-v526/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-cnmp-2023-seguranca-institucional-v527/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-seduc-al-2021-ensino-religioso-v528/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-fub-2016-audiovisual-cargo14-v529/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-tbg-2023-analista-comercializacao-v530/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-mpto-2024-jornalismo-cargo10-v531/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-tjpa-2025-eletrica-cargo13-v532/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-pf-2018-escrivao-cargo13-v533/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-prf-2020-cfp-terceira-turma-v534/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-fub-2016-equipamentos-odontologicos-cargo15-v535/acervo-extraido')

raizesAtuais.unshift('tmp/revisao-profissional/revisao-prefeitura-sao-cristovao-2019-historia-v536/acervo-extraido')

raizesAtuais.unshift('tmp/revisao-profissional/revisao-fub-2020-psicologia-clinica-v537/acervo-extraido')

raizesAtuais.unshift('tmp/revisao-profissional/revisao-ansa-2026-enfase25-mecanica-v538/acervo-extraido')

raizesAtuais.unshift('tmp/revisao-profissional/revisao-anp-2022-atividade3-infraestrutura-movimentacao-v539/acervo-extraido')

raizesAtuais.unshift('tmp/revisao-profissional/revisao-sefaz-ce-2021-cargo1-auditor-v540/acervo-extraido')

raizesAtuais.unshift('tmp/revisao-profissional/revisao-pcse-delegado-2018-conhecimentos-especificos-v541/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-fnde-curso-formacao-4-turma-2026-v542/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-trf6-2025-engenharia-eletrica-v543/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-emap-2018-cargo3-comunicacao-v544/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-trf6-2025-arquitetura-v545/acervo-extraido')
raizesAtuais.unshift('tmp/revisao-profissional/revisao-mpto-2024-cargo9-engenharia-civil-v546/acervo-extraido')

raizesAtuais.unshift('tmp/revisao-profissional/revisao-stj-2024-cargo9-engenharia-civil-v547/acervo-extraido')

raizesAtuais.unshift('tmp/revisao-profissional/revisao-tcepa-2016-cargo18-jornalismo-v548/acervo-extraido')

raizesAtuais.unshift('tmp/revisao-profissional/revisao-petrobras-2021-enfase20-seguranca-trabalho-v549/acervo-extraido')

raizesAtuais.unshift('tmp/revisao-profissional/revisao-anm-2024-cargo12-relacoes-publicas-v550/acervo-extraido')
