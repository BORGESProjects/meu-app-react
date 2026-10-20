"""Use only the institution/year printed in the question, never PDF/course dates."""
import re
import unicodedata

ASSIMILACAO = 'Questões de assimilação'


def plain(text):
    return unicodedata.normalize('NFKD', text).encode('ascii', 'ignore').decode().upper()


ALIASES = [
    (r'ESPCEX|\bAMAN\b', 'EsPCEx'), (r'ESFCEX', 'EsFCEx'),
    (r'\bESS?A\b', 'ESA'), (r'\bEEAR\b', 'EEAR'), (r'\bEPCAR\b', 'EPCAR'),
    (r'COL[. ]*(?:EGIO\s+)?NAVAL|COLEGIO NAVAL|^CN(?:\b|-)|^CN\d', 'Colégio Naval'),
    (r'ESC(?:OLA|\.)\s*NAVAL|^EN(?:\b|-)', 'Escola Naval'), (r'\bEFOMM\b', 'EFOMM'),
    (r'\bEAM\b', 'EAM'), (r'\bAFA\b', 'AFA'), (r'\bIME\b', 'IME'), (r'\bITA\b', 'ITA'),
    (r'\bENEM\b', 'ENEM'), (r'\bFUVEST\b|^USP(?:\b|-)', 'FUVEST'),
    (r'\bMACK(?:ENZIE)?\b', 'MACKENZIE'), (r'\bFGV(?:RJ|SP)?\b', 'FGV'),
    (r'CESGRANRIO', 'CESGRANRIO'), (r'\bCFTMG\b|CEFET[ -]?MG', 'CFTMG'),
    (r'\bCFTCE\b|CEFET[ -]?CE', 'CFTCE'), (r'CEFET[ -]?PR|\bUTFPR\b', 'UTFPR'),
    (r'CEFET[ -]?RJ', 'CEFET-RJ'), (r'CEFET[ -]?SP', 'CEFET-SP'),
    (r'IF[ -]?SUL', 'IFSUL'), (r'\bFEI(?:-SP)?\b', 'FEI'),
    (r'\bUFRS\b', 'UFRGS'), (r'\bUFCE\b', 'UFC'), (r'\bUFSE\b', 'UFS'),
    (r'\bPUC[ -]?(?:PR|PARANA)\b|PUCPR', 'PUC-PR'),
    (r'\bPUC[ -]?(?:RIO|RJ)\b', 'PUC-Rio'), (r'\bPUC[ -]?RS\b', 'PUCRS'),
    (r'\bPUC[ -]?SP\b', 'PUC-SP'), (r'\bPUC[ -]?MG\b', 'PUC-MG'),
    (r'PUCCAMP', 'PUC-Campinas'),
    (r'\bPUC\b', 'PUC'), (r'\bACA[FV]E\b', 'ACAFE'),
    (r'IBMECRJ|IBMEC[ -]?RJ', 'IBMEC-RJ'),
    (r'ALBERT EINSTEIN', 'Albert Einstein'), (r'PEQUENO PRINCIPE', 'FPP'),
    (r'SANTA CASA', 'Santa Casa'), (r'FAC\.? DA CIDADE', 'Faculdade da Cidade'),
    (r'U\.?F\.? SANTA MARIA', 'UFSM'), (r'U\.? PASSO FUNDO', 'UPF'),
    (r'\bCBM[ -]?RJ\b', 'CBM-RJ'),
    (r'^CP2\b', 'CP2'),
]


KNOWN = set('UFPR UFSC UFRGS UFSM UFPB UFPE UFPEL UFMA UFRN UFU UFV UFMT UFMS UFG UFGD UFRJ UFF UFES UFPA UFAM UFAC UFRR UFAL UFC UFCG UFLA UFSJ UFS UFT UFTM UFJF UFRRJ UFSCar UNESP UNICAMP UNIFESP UNIFAL UNIFEI UNIFENAS UNIMONTES UNICENTRO UNIOESTE UEM UEL UEPG UEMA UEPA UECE UEPB UESPI UEFS UERJ UERN UEG UEMG UESC UPE UFRB UERN UFPI UFPel UFRPE UERGS UNIRIO UNIR UNEB UNAMA UNISC UNIVALI UNISA UNIUBE UNIP UNIVESP ULBRA URCA UVA UCPel UCS UCDB UNIFOR FATEC FAMERP FAMEMA FCMMG FMP FMJ FMU FFFCMPA FCMSCSP FCMSC FEEVALE FEEQ FAAP FAENQUIL ESPM INSPER IBMEC IBECRJ IBMEC-RJ INATEL FEI FTT COTIL CMRJ CEFET IFSP IFSUL IFAL IFPE IFCE IFSC IFPR IFMG IFTM IFBA IFMA IFGOIANO SENAI UDESC UPF UNICRUZ ULBRA UFSJ UFT USF USCS OSEC FAEE FALBE UMC UCMG UNAERP'.upper().split())


KNOWN.update('UFMG UEMS UEA UNISINOS UNITAU VUNESP CPS CFTRJ CFTPR CFTSC ESAN EBMSP IMED COTUCA CP2 FUNDATEC CFN CPOR NPOR'.split())


def classify(reference):
    if not reference:
        return {'banca': ASSIMILACAO, 'concurso': ASSIMILACAO, 'ano': None, 'referencia_original': None}
    raw = reference.strip()
    key = plain(raw)
    key = re.sub(r'^[GS][12]\s*[-–:]?\s*', '', key).strip()
    year = re.search(r'\b(?:19|20)\d{2}\b', key)
    bank = None
    for pattern, value in ALIASES:
        if re.search(pattern, key):
            bank = value or ('FGV' if 'FGV' in key else 'CESGRANRIO')
            break
    if bank is None:
        candidate = re.match(r'^([A-Z]{2,18})', key)
        if candidate and candidate[1] in KNOWN:
            bank = candidate[1]
    if bank is None:
        if not re.search('[A-Z]',key) or re.match(r'^(?:INEDIT[AO]|ADAPTAD[AO]|MODELO|TEOREMA|QUESTAO DE|AUTORAL|G[12])(?:\b|$)', key):
            return {'banca': ASSIMILACAO, 'concurso': ASSIMILACAO, 'ano': None, 'referencia_original': raw, 'adaptada': bool(re.search('ADAPTAD', key))}
        raise ValueError('identificação institucional não reconhecida: '+raw)
    return {'banca': bank, 'concurso': raw, 'ano': int(year[0]) if year else None, 'referencia_original': raw, 'adaptada': bool(re.search('ADAPTAD', key))}
