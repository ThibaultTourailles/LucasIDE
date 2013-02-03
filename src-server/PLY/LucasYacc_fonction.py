# -*- coding:utf-8 -*-

import ply.yacc as yacc

from LucasLex import tokens, lex
import LucasLex

from LucasNatifs import Entier, Booleen
from LucasArbre_fonction import *

# Precedence
precedence = (
		 ('right', 'AFF')
		,('left' , 'OU' , 'ET' )
		,('left' , 'EGL', 'DIF')
		,('left' , 'IOE', 'INF', 'SOE', 'SUP')
		,('left' , 'ADD', 'SOU')
		,('left' , 'MUL', 'DIV', 'MOD')
		,('right', 'MOINS_UNAIRE')
		,('right', 'NON_LOGIQUE')
)

# __STRUCTURE__

def p_programme(p):
	'''programme : PROGRAMME MOT PRG PRD FDL corps_de_programme'''
	p[0] = NoeudProgramme( p[2], p[6] )

def p_corps_de_programme(p):
	'''corps_de_programme : corps_de_programme_avec_fonctions
	   					  | corps_de_programme_sans_fonction'''
	p[0] = p[1]

def p_corps_de_programme_avec_fonctions(p):
	'''corps_de_programme_avec_fonctions : decl_fcts bloc_simple'''
	p[0] = p[2]

def p_corps_de_programme_sans_fonction(p):
	'''corps_de_programme_sans_fonction : bloc_simple'''
	p[0] = p[1]

def p_decl_fcts_AGREG(p):
	'''decl_fcts : decl_fcts decl_fct'''

def p_decl_fcts(p):
	'''decl_fcts : decl_fct'''

def p_fins_de_ligne_AGREG(p):
	'''fins_de_ligne : fin_de_ligne FDL'''

def p_fins_de_ligne(p):
	'''fins_de_ligne : fin_de_ligne'''

def p_fin_de_ligne(p):
	'''fin_de_ligne : FDL'''

def p_ouverture(p):
	'''ouverture : ouverture_fdldebfdl
	   			 | ouverture_debfdl
	   			 | ouverture_fdldeb
	   			 | ouverture_ssfdl'''

def p_ouverture_fdldebfdl(p):
	'''ouverture_fdldebfdl : fins_de_ligne DEB fins_de_ligne'''
	   
def p_ouverture_debfdl(p):
	'''ouverture_debfdl : DEB fins_de_ligne'''
	   
def p_ouverture_fdldeb(p):
	'''ouverture_fdldeb : fins_de_ligne DEB'''
	   
def p_ouverture_ssfdl(p):
	'''ouverture_ssfdl : DEB'''

def p_fermeture(p):
	'''fermeture : fermeture_fdldebfdl
	   			 | fermeture_debfdl
	   			 | fermeture_fdldeb
	   			 | fermeture_ssfdl'''

def p_fermeture_fdldebfdl(p):
	'''fermeture_fdldebfdl : fins_de_ligne FIN fins_de_ligne'''
	   
def p_fermeture_debfdl(p):
	'''fermeture_debfdl : FIN fins_de_ligne'''
	   
def p_fermeture_fdldeb(p):
	'''fermeture_fdldeb : fins_de_ligne FIN'''
	   
def p_fermeture_ssfdl(p):
	'''fermeture_ssfdl : FIN'''

def p_sections__AGREG(p):
	'''sections : sections section'''
	p[1].extend( p[2] )
	p[0] = p[1]

def p_sections(p):
	'''sections : section'''
	p[0] = p[1]

def p_section(p):
	'''section : instruction
	   		   | bloc_simple
	   		   | bloc_conditionnel
	   		   | bloc_iteratif'''
	p[0] = [ p[1] ]


# __ INSTRUCTIONS __

def p_instruction(p):
	'''instruction : expression fins_de_ligne
	   			   | declaration fins_de_ligne
	   			   | retourner fins_de_ligne
	   			   | AFFICHER fins_de_ligne'''
	p[0] = NoeudInstruction( p[1] )

def p_expression(p):
	'''expression : expr_par
	   			  | expr_eval'''
	p[0] = p[1]

# __ Blocs __

def p_bloc_simple(p):
	'''bloc_simple : ouverture sections fermeture'''
	p[0] = NoeudBlocSimple( p[2] )

def p_bloc_conditionnel(p):
	'''bloc_conditionnel : bloc_si'''
#						  | bloc_seloncas'''
	p[0] = p[1]

def p_bloc_iteratif(p):
	'''bloc_iteratif : bloc_tantquefaire
	   				 | bloc_fairetantque'''
#	   				 | bloc_pourchaquedans'''
	p[0] = p[1]
# __Bloc si__

def p_bloc_si(p):
	'''bloc_si : bloc_si_si
	   		   | bloc_si_si_sinon
	   		   | bloc_si_si_sinonsis
	   		   | bloc_si_si_sinonsis_sinon'''
	p[0] = NoeudSi( p[1] )

def p_bloc_si_si(p):
	'''bloc_si_si : SI condition_instructions_ALORS'''
	p[0] = [ p[2] ]
	   
def p_bloc_si_si_sinon(p):
	'''bloc_si_si_sinon : bloc_si_si sinon'''
	p[1].append( p[2] )
	p[0] = p[1]

def p_sinon(p):
	'''sinon : sinon_ligne
			 | sinon_bloc'''
	p[0] = p[1]
	
def p_sinon_ligne(p):
	'''sinon_ligne : SINON instruction'''
	p[0] = ConditionInstruction( NoeudObjet( Booleen(True) ), p[2], 'sinon' )

def p_sinon_bloc(p):
	'''sinon_bloc : sinon_ou_sinonfdl bloc_simple '''
	p[0] = ConditionInstruction( NoeudObjet( Booleen(True) ), p[2], 'sinon' )

def p_sinon_ou_sinonfdl(p):
	'''sinon_ou_sinonfdl : SINON FDL
	   					 | SINON'''

def p_bloc_si_si_sinonsis(p):
	'''bloc_si_si_sinonsis : bloc_si_si sinonsis'''
	p[1].extend( p[2] )
	p[0] = p[1]

def p_sinonsis_AGREG(p):
	'''sinonsis : sinonsis sinonsi'''
	p[1].extend( p[2] )
	p[0] = p[1]
	   
def p_sinonsis(p):
	'''sinonsis : sinonsi'''
	p[0] = p[1]

def p_sinonsi(p):
	'''sinonsi : SINONSI condition_instructions_ALORS'''
	p[0] = [ p[2] ]
	
def p_bloc_si_si_sinonsis_sinon(p):
	'''bloc_si_si_sinonsis_sinon : bloc_si_si_sinonsis sinon'''
	p[1].append( p[2] )
	p[0] = p[1]

def p_condition_instructions_ALORS(p):
	'''condition_instructions_ALORS : condition_instructions_ALORS_ligne
	   						 		| condition_instructions_ALORS_bloc'''
	p[0] = p[1]

# __ condition_instructions_ALORS __

def p_condition_instructions_ALORS_ligne(p):
	'''condition_instructions_ALORS_ligne : expression ALORS instruction'''
	p[0] = ConditionInstruction( p[1], p[3] )

def p_condition_instructions_ALORS_bloc(p):
	'''condition_instructions_ALORS_bloc : expression alors_ou_alorsfdl bloc_simple'''
	p[0] = ConditionInstruction( p[1], p[3] )

def p_alors_ou_alorsfdl(p):
	'''alors_ou_alorsfdl : ALORS fins_de_ligne
	   					 | ALORS'''

# __ Bloc iteratif __

# __ Bloc TantqueFaire

def p_bloc_tantquefaire(p):
	'''bloc_tantquefaire : TANTQUE condition_instructions_FAIRE'''
	p[0] = NoeudTantQueFaire( p[2] )

def p_condition_instructions_FAIRE(p):
	'''condition_instructions_FAIRE : condition_instructions_FAIRE_ligne
	   						  		| condition_instructions_FAIRE_bloc'''
	p[0] = p[1]

def p_condition_instructions_FAIRE_ligne(p):
	'''condition_instructions_FAIRE_ligne : expression FAIRE instruction'''
	p[0] = ConditionInstruction( p[1], p[3] )

def p_condition_instructions_FAIRE_bloc(p):
	'''condition_instructions_FAIRE_bloc : expression faire_ou_fairefdl bloc_simple'''
	p[0] = ConditionInstruction( p[1], p[3] )


# __ Bloc FaireTantQue

def p_bloc_fairetantque(p):
	'''bloc_fairetantque : FAIRE_instructions TANTQUE expression fins_de_ligne'''
	p[0] = NoeudFaireTantQue( ConditionInstruction (p[3], p[1]) )

def p_FAIRE_instructions(p):
	'''FAIRE_instructions : FAIRE_instructions_ligne
	   					  | FAIRE_instructions_bloc'''
	p[0] = p[1]

def p_FAIRE_instructions_ligne(p):
	'''FAIRE_instructions_ligne : FAIRE instruction expression fins_de_ligne'''
	p[0] = p[2]

def p_FAIRE_instructions_bloc(p):
	'''FAIRE_instructions_bloc : faire_ou_fairefdl bloc_simple'''
	p[0] = p[2]

def p_faire_ou_fairefdl(p):
	'''faire_ou_fairefdl : FAIRE FDL
	   					 | FAIRE'''

# __ AFFICHER Afficher afficher __	
def p_AFFICHER(p):
	'''AFFICHER : OUT PNT AFI PRG expression PRD'''
	p[0] = NoeudAff(p[5])

def p_expr_par(p):
	'''expr_par : PRG expr_eval PRD'''
	p[0] = p[2]

# __ Expr evaluable __

def p_expr_eval(p):
	'''expr_eval : expr_eval_math
	   			 | expr_eval_bool
	   			 | expr_eval_car
	   			 | expr_eval_chc
	   			 | expr_eval_aff
				 | valeur_stockee
				 | appel_fonction'''
	p[0] = p[1]

# AFFECTATION VARIABLE

def p_valeur_stockee(p):
	'''valeur_stockee : variable'''
	p[0] = p[1]

def p_variable(p):
	'''variable : MOT'''
	p[0] = NoeudObjetVariable( p[1] )

def p_expr_eval_aff(p):
	'''expr_eval_aff : variable AFF expression'''
	p[0] = NoeudAffectation(p[1], p[3])
	
# __ Fonctions __ 

def p_decl_fct(p):
	'''decl_fct : proto_fct FDL bloc_simple'''
	p[0] = NoeudDeclarationFonction( p[1], p[3] )

def p_proto_fct(p):
	'''proto_fct : proto_fct_avec_retour
	   			 | proto_fct_sans_retour'''
	p[0] = p[1]
	   
def p_proto_fct_avec_retour(p):
	'''proto_fct_avec_retour : MOT par_proto_fct type'''
	p[0] = PrototypeFonction( p[1], p[2], p[3] )

def p_type(p):
	'''type : DCL_ENT
	   		| DCL_FLO
	   		| DCL_BOO
	   		| DCL_CAR
	   		| DCL_CHC'''
	p[0] = p[1]

def p_proto_fct_sans_retour(p):
	'''proto_fct_sans_retour : MOT par_proto_fct'''
	p[0] = PrototypeFonction( p[1], p[2] )

def p_par_proto_fct(p):
	'''par_proto_fct : PRG parametres_proto PRD'''
	p[0] = p[2]

def p_parametres_proto_AGREG(p):
	'''parametres_proto : parametres_proto VRG parametre_proto'''
	p[1].extend( p[3] )
	p[0] = p[1]

def p_parametres_proto(p):
	'''parametres_proto : parametre_proto'''
	p[0] = p[1]

def p_parametre_proto(p):
	'''parametre_proto : parametre_proto_ref
	   				   | parametre_proto_val'''
	p[0] = [ p[1] ]

def p_parametre_proto_ref(p):
	'''parametre_proto_ref : type REF MOT'''
	p[0] = ParametrePrototype( p[1], False, p[3] )

def p_parametre_proto_val(p):
	'''parametre_proto_val : parametre_proto_val_explicite
	   					   | parametre_proto_val_implicite'''
	p[0] = p[1]

def p_parametre_proto_val_explicite(p):
	'''parametre_proto_val_explicite : type VAL MOT'''
	p[0] = ParametrePrototype( p[1], True, p[3] )

def p_parametre_proto_val_implicite(p):
	'''parametre_proto_val_implicite : type MOT'''
	p[0] = ParametrePrototype( p[1], True, p[2] )


def p_appel_fonction(p):
	'''appel_fonction : MOT par_appel_fct'''
	p[0] = NoeudAppelFonction( p[1], p[2] )

def p_par_appel_fct(p):
	'''par_appel_fct : PRG parametres_appel PRD'''
	p[0] = ( p[2] )

def p_parametres_appel_AGREG(p):
	'''parametres_appel : parametres_appel VRG parametre_appel'''
	p[1].extend( p[3] )
	p[0] = p[1]
	
def p_parametre_appel(p):
	'''parametres_appel : parametre_appel'''
	p[0] = p[1]

def p_parametre_appel_exp(p):
	'''parametre_appel : expression'''
	p[0] = [ p[1] ]

def p_retourner(p):
	'''retourner : RET expression'''
	p[0] = NoeudRetourner( p[2] )

# __ Expr declaration __	

def p_declaration(p):
	'''declaration : declaration_entier
	   			   | declaration_flottant
	   			   | declaration_booleen
	   			   | declaration_car
	   			   | declaration_chc'''
	p[0] = p[1]

def p_declaration_entier(p):
	'''declaration_entier : declaration_entier_arg
	   				      | declaration_entier_def'''
	p[0] = p[1]
	   
def p_declaration_entier_arg(p):
	'''declaration_entier_arg : DCL_ENT MOT expr_par'''
	p[0] = NoeudDeclarationVariable( 'Entier', p[2], p[3], p.lexer.level )
	   				   
def p_declaration_entier_def(p):
	'''declaration_entier_def : DCL_ENT MOT PRG PRD'''
	p[0] = NoeudDeclarationVariable( 'Entier', p[2], NoeudObjet( Entier(0) ), p.lexer.level )

def p_declaration_flottant(p):
	'''declaration_flottant : declaration_flottant_arg
	   					    | declaration_flottant_def'''
	p[0] = p[1]
	   
def p_declaration_flottant_arg(p):
	'''declaration_flottant_arg : DCL_FLO MOT expr_par'''
	p[0] = NoeudDeclarationVariable( 'Flottant', p[2], p[3], p.lexer.level )
	   				   
def p_declaration_flottant_def(p):
	'''declaration_flottant_def : DCL_FLO MOT PRG PRD'''
	p[0] = NoeudDeclarationVariable( 'Flottant', p[2], NoeudObjet( Flottant(0) ), p.lexer.level )

def p_declaration_booleen(p):
	'''declaration_booleen : declaration_booleen_arg
	   					   | declaration_booleen_def'''
	p[0] = p[1]
	   
def p_declaration_booleen_arg(p):
	'''declaration_booleen_arg : DCL_BOO MOT expr_par'''
	p[0] = NoeudDeclarationVariable( 'Booleen', p[2], p[3], p.lexer.level )
	   				   
def p_declaration_booleen_def(p):
	'''declaration_booleen_def : DCL_BOO MOT PRG PRD'''
	p[0] = NoeudDeclarationVariable( 'Booleen', p[2], NoeudObjet( Booleen(False) ), p.lexer.level )

def p_declaration_car(p):
	'''declaration_car : declaration_car_arg
	   				   | declaration_car_def'''
	p[0] = p[1]
	   
def p_declaration_car_arg(p):
	'''declaration_car_arg : DCL_CAR MOT expr_par'''
	p[0] = NoeudDeclarationVariable( 'Car', p[2], p[3], p.lexer.level )
	   				   
def p_declaration_car_def(p):
	'''declaration_car_def : DCL_CAR MOT PRG PRD'''
	p[0] = NoeudDeclarationVariable( 'Car', p[2], NoeudObjet( Car('\0') ), p.lexer.level )

def p_declaration_chc(p):
	'''declaration_chc : declaration_chc_arg
	   				   | declaration_chc_def'''
	p[0] = p[1]
	   
def p_declaration_chc_arg(p):
	'''declaration_chc_arg : DCL_CHC MOT expr_par'''
	p[0] = NoeudDeclarationVariable( 'Chc', p[2], p[3], p.lexer.level )
	   				   
def p_declaration_chc_def(p):
	'''declaration_chc_def : DCL_CHC MOT PRG PRD'''
	p[0] = NoeudDeclarationVariable( 'Chc', p[2], NoeudObjet( Chc("") ), p.lexer.level )




# __MATH NUM__

def p_expr_eval_math(p):
	'''expr_eval_math : expr_eval_math_unaire
	   				  |	expr_eval_math_binaire
	   				  |	nombre'''
	p[0] = p[1]
	
def p_expr_eval_math_unaire(p):
	'''expr_eval_math_unaire : SOU expression %prec MOINS_UNAIRE'''
	p[0] = NoeudOperationBinaire(p[2], Natif.__mul__ ,NoeudObjet(Entier(-1)))

def p_expr_eval_math_binaire(p):
	'''expr_eval_math_binaire : expr_eval_math_binaire_calc
	   						  | expr_eval_math_binaire_comp'''
	p[0] = p[1]

	# expr binaire calculatoire	   
def p_expr_eval_math_binaire_calc(p):
	'''expr_eval_math_binaire_calc : expr_eval_math_binaire_calc_additive
	   						       | expr_eval_math_binaire_calc_multiplicative'''
	p[0] = p[1]
	   
def p_expr_eval_math_binaire_calc_additive(p):
	'''expr_eval_math_binaire_calc_additive : expr_eval_math_binaire_calc_add
	   							  		 	| expr_eval_math_binaire_calc_sou'''
	p[0] = p[1]

def p_expr_eval_math_binaire_calc_multiplicative(p):
	'''expr_eval_math_binaire_calc_multiplicative : expr_eval_math_binaire_calc_mul
	   						  					  | expr_eval_math_binaire_calc_div
	   						  					  | expr_eval_math_binaire_calc_mod'''
	p[0] = p[1]

def p_expr_eval_math_binaire_calc_add(p):
	'''expr_eval_math_binaire_calc_add : expression ADD expression'''
	p[0] = NoeudOperationBinaire(p[1], Natif.__add__ ,p[3])

def p_expr_eval_math_binaire_calc_sou(p):
	'''expr_eval_math_binaire_calc_sou : expression SOU expression'''
	p[0] = NoeudOperationBinaire(p[1], Natif.__sub__  ,p[3])

def p_expr_eval_math_binaire_calc_mul(p):
	'''expr_eval_math_binaire_calc_mul : expression MUL expression'''
	p[0] = NoeudOperationBinaire(p[1], Natif.__mul__ ,p[3])

def p_expr_eval_math_binaire_calc_div(p):
	'''expr_eval_math_binaire_calc_div : expression DIV expression'''
	p[0] = NoeudOperationBinaire(p[1], Natif.__div__ ,p[3])

def p_expr_eval_math_binaire_calc_mod(p):
	'''expr_eval_math_binaire_calc_mod : expression MOD expression'''
	p[0] = NoeudOperationBinaire(p[1], Natif.__mod__ ,p[3])

	# expr binaire comparative

def p_expr_eval_math_binaire_comp(p):
	'''expr_eval_math_binaire_comp : expr_eval_math_binaire_comp_diffegal
	   							   | expr_eval_math_binaire_comp_infsup'''
	p[0] = p[1]
	   
def p_expr_eval_math_binaire_comp_diffegal(p):
	'''expr_eval_math_binaire_comp_diffegal : expr_eval_math_binaire_comp_EGL
	   										| expr_eval_math_binaire_comp_DIF'''
	p[0] = p[1]

def p_expr_eval_math_binaire_comp_infsup(p):
	'''expr_eval_math_binaire_comp_infsup : expr_eval_math_binaire_comp_IOE
	   									  | expr_eval_math_binaire_comp_INF
	   									  | expr_eval_math_binaire_comp_SOE
	   									  | expr_eval_math_binaire_comp_SUP'''
	p[0] = p[1]

def p_expr_eval_math_binaire_comp_EGL(p):
	'''expr_eval_math_binaire_comp_EGL : expression EGL expression'''
	p[0] = NoeudOperationBinaire(p[1], Natif.__eq__ ,p[3])

def p_expr_eval_math_binaire_comp_DIF(p):
	'''expr_eval_math_binaire_comp_DIF : expression DIF expression'''
	p[0] = NoeudOperationBinaire(p[1], Natif.__ne__ ,p[3])

def p_expr_eval_math_binaire_comp_IOE(p):
	'''expr_eval_math_binaire_comp_IOE : expression IOE expression'''
	p[0] = NoeudOperationBinaire(p[1], Natif.__le__ ,p[3])

def p_expr_eval_math_binaire_comp_INF(p):
	'''expr_eval_math_binaire_comp_INF : expression INF expression'''
	p[0] = NoeudOperationBinaire(p[1], Natif.__lt__,p[3])

def p_expr_eval_math_binaire_comp_SOE(p):
	'''expr_eval_math_binaire_comp_SOE : expression SOE expression'''
	p[0] = NoeudOperationBinaire(p[1], Natif.__ge__, p[3])

def p_expr_eval_math_binaire_comp_SUP(p):
	'''expr_eval_math_binaire_comp_SUP : expression SUP expression'''
	p[0] =  NoeudOperationBinaire(p[1], Natif.__gt__,p[3])

	# nombre
def p_nombre(p):
	'''nombre : entier
	   		  | flottant'''
	p[0] = p[1]
	   
def p_entier(p):
	'''entier : ENT'''
	p[0] = NoeudObjet(p[1])

def p_flottant(p):
	'''flottant : FLO'''
	p[0] = NoeudObjet(p[1])

# __MATH LOGIQUE__

def p_expr_eval_bool(p):
	'''expr_eval_bool : expr_eval_bool_unaire
	   				  | expr_eval_bool_binaire
	   				  | booleen'''
	p[0] = p[1]

def p_expr_eval_bool_unaire(p):
	'''expr_eval_bool_unaire : NON expression %prec NON_LOGIQUE'''
	p[0] = NoeudOperationUnaire(p[2], Natif.__not__)

def p_expr_eval_bool_binaire(p):
	'''expr_eval_bool_binaire : expr_eval_bool_binaire_et
	   						  | expr_eval_bool_binaire_ou'''
	p[0] = p[1]

def p_expr_eval_bool_binaire_et(p):
	'''expr_eval_bool_binaire_et : expression ET expression'''
	   							
	p[0] = NoeudOperationBinaire(p[1], Natif.__and__,p[3])

def p_expr_eval_bool_binaire_ou(p):
	'''expr_eval_bool_binaire_ou : expression OU expression'''
	p[0] = NoeudOperationBinaire(p[1], Natif.__or__,p[3])

def p_booleen(p):
	'''booleen : booleen_vrai
	   		   | booleen_faux'''
	p[0] = p[1]
	   
def p_booleen_vrai(p):
	'''booleen_vrai : VRAI'''
	p[0] = NoeudObjet( Booleen( True ) )

def p_booleen_faux(p):
	'''booleen_faux : FAUX'''
	p[0] = NoeudObjet( Booleen( False ) )


# __CARARCTÈRE__

def p_expr_eval_car(p):
	'''expr_eval_car : caractere'''
	p[0] = p[1]

def p_caractere(p):
	'''caractere : CAR'''
	p[0] = NoeudObjet(p[1])

# __CHAINE__

def p_expr_eval_chc(p):
	'''expr_eval_chc : chaine'''
	p[0] = p[1]

def p_chaine(p):
	'''chaine : CHC'''
	p[0] = NoeudObjet(p[1])
	

# __ERREURS__

def p_error(p):
	raise Exception("Erreur de syntaxe ligne '%s' : , '%s'" % (p.lineno,p.value))

def getYacc():
	return yacc.yacc(debug=False, optimize=False, write_tables=0)

if __name__ == "__main__":
	lexer = lex.lex(module=LucasLex)
	lex.lexer.level = 0
	yaccer = getYacc()
	res = yaccer.parse(file('test.txt').read(), lexer=lexer)
	res = res.executer()
	print res
