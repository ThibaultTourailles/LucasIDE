# -*- coding:utf-8 -*-

import ply.lex as lex
from LucasNatifs import Entier, Flottant, Booleen, Car, Chc

reserved = {
# Contrôle
	 'SI'		: 'SI'
	,'ALORS'	: 'ALORS'
	,'SINONSI'	: 'SINONSI'
	,'SINON'	: 'SINON'
# Boucle
	,'TANTQUE'	: 'TANTQUE'
	,'FAIRE'	: 'FAIRE'
# Booléen
	,'VRAI'		: 'VRAI'
	,'FAUX'		: 'FAUX'
	,'ET'		: 'ET'
	,'OU'		: 'OU'
	,'NON'		: 'NON'
# AFFICHAGE
	,'ecrire'	: 'AFI'
	,'Out'		: 'OUT'
# Déclaration des ypes natifs
	,'Entier'	: 'DCL_ENT'
	,'Flottant' : 'DCL_FLO'
	,'Car'		: 'DCL_CAR'
	,'Chc'		: 'DCL_CHC'
	,'Booleen'	: 'DCL_BOO'
# Structure
	,'PROGRAMME': 'PROGRAMME'
	,'{'		: 'DEB'
	,'}'		: 'FIN'
# Prototype de fonction
	,'REF'		: 'REF'
	,'VAL'		: 'VAL'
# Retour
	,'RETOURNER': 'RET'

}

tokens=[
# Opérateurs
	'ADD', 'SOU', 'MUL', 'DIV', 'MOD', 'AFF',
# Comprateurs
	'INF', 'IOE', 'SUP', 'SOE', 'EGL', 'DIF',
# Ponctuation
	'PRG', 'PRD', 'FDL',
# Types natifs
	'ENT', 'FLO', 'CAR', 'CHC',
# Identifiant
	'MOT',
# Virgule
	'VRG',
	'PNT'
] + list(reserved.values())

	# Opérateurs
t_ADD = r'\+'
t_SOU = r'-'
t_MUL = r'\*'
t_DIV = r'/'
t_MOD = r'%'
	# Comparateurs
t_IOE = r'<='
t_INF = r'<'
t_SOE = r'>='
t_SUP = r'>'
t_EGL = r'=='
t_DIF = r'!='
	# Ponctuation
t_PRG = r'\('
t_PRD = r'\)'
	# Affectation
t_AFF = r'='
	# Virgule
t_VRG = r','
t_PNT = r'\.'


def t_DEB(t):
	r'{'
	t.lexer.level += 1
	return t
	
def t_FIN(t):
	r'}'
	t.lexer.level -= 1
	return t

def t_FDL(t):
	r'\n+'
	t.lexer.lineno += len(t.value)
	return t

def t_FLO(t):
	r'\d+\.\d+'
	t.value = Flottant(float(t.value))
	return t

def t_ENT(t):
	r'\d+'
	t.value = Entier(int(t.value))
	return t

def t_MOT(t):
	r'[a-zA-Z][a-zA-Z0-9]*'
	t.type = reserved.get(t.value,'MOT')
	return t

def t_CAR(t):
	r"'[^']'"
	t.value = Car(t.value[1])
	return t

def t_CHC(t):
	r'"[^"]*"'
	t.value = Chc( str(t.value[ 1 : -1 ]) )
	return t

# Error
def t_error(t):
	raise Exception("Caractère(s) inconnu(s) : %s" % t.value)

t_ignore = ' \t'

def getLex():
	res = lex.lex()#optimize=1,lextab="lextab")
	lex.lexer.level = 0
	return res

if __name__=="__main__":
	import sys
	source = file(sys.argv[1]).read()
	lexer = getLex()
	lexer.input(source)
	while True:
		tok = lexer.token()
		if not tok: break
		print tok.__str__() + " %s" % lex.lexer.level
