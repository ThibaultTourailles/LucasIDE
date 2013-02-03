# -*- coding:utf-8 -*-

from LucasNatifs import *
from LucasPoolVariable import *

# Kevbac DOM 
from xml.dom.minidom import getDOMImplementation
impl = getDOMImplementation()
document = impl.createDocument(None, "some_tag", None)
from utils import isTuple

classes = ['Entier', 'Flottant', 'Car', 'Chc', 'Booleen']

variables = {
				
			}

class Noeud:
	def __init__(self):
		pass;
		
	def executer(self, espace):
		pass;
	
# Racine
class NoeudProgramme(Noeud):
	resultat = ""
	domRes = None
	erreurs = []

	def __init__(self,arbre):
		self.arbre = arbre
		
	def executer(self, espace):

		domRes = document.createElement("programme")
		variables[espace] = PoolVariable()
		domRes.appendChild(self.arbre.executer(espace))

		erreursElem = document.createElement("erreurs")
		for i in xrange(len(NoeudProgramme.erreurs)):
			erreurElem = document.createElement("erreur")
			erreurElem.appendChild(document.createTextNode(NoeudProgramme.erreurs[i]))
			erreursElem.appendChild(erreurElem)
		domRes.appendChild(erreursElem)
		NoeudProgramme.erreurs = []

		NoeudProgramme.resultat = domRes.toxml()
		print domRes.toprettyxml(" ", "\n")
		return NoeudProgramme.resultat
		
# Noeuds ayant en attribut une liste de noeuds		
class NoeudEnsemble(Noeud):
	def __init__(self, enfants):
		self.enfants = enfants
		
	def executer(self, espace):
		elem = document.createElement("ensemble")
		for enfant in self.enfants:
			res = enfant.executer(espace)
			if isTuple(res):
				elem.appendChild(res[1])
			else:
				elem.appendChild(res)
		return elem
		
class NoeudSection(NoeudEnsemble):
	def __init__(self, enfants):
		NoeudEnsemble.__init__(self, enfants)
			
class NoeudInstruction(NoeudEnsemble):
	def __init__(self, enfants):
		NoeudEnsemble.__init__(self, enfants)
		
class NoeudSi(NoeudEnsemble):
	def __init__(self, enfants):
		NoeudEnsemble.__init__(self, enfants)
		
	def executer(self, espace):
		elem = document.createElement("sas")
		variables[espace].ajouterProfondeur()
		fini = False
		i = 0
		while i < len(self.enfants) and not(fini):
			currentElem = document.createElement("si")
			currentElem.setAttribute("num" , str(i))
			res = self.enfants[i].executer(espace)

			if isTuple(res):
				currentElem.appendChild(res[1])
				res = res[0]
			else:
				currentElem.appendChild(document.createTextNode(str(res)))

			elem.appendChild(currentElem)
			i += 1
			fini = res
		variables[espace].supprimerProfondeur()
		return elem

# Noeuds correspondant à la déclaration et à l'affectation de variable 
class NoeudVariable(Noeud):
		def __init__(self, nom, noeudExpression):
			self.nom = nom
			self.noeudExpression = noeudExpression
			
		def executer(self, espace):
			pass;

class NoeudSupprimerProfondeur(Noeud):
	def __init__(self):
		pass;
	
	def executer(self, espace):
		variables[espace].supprimerProfondeur()
			
class NoeudDeclaration(NoeudVariable):
	def __init__(self, type, nom, noeudExpression, profondeur):
		NoeudVariable.__init__(self, nom, noeudExpression)
		self.type = type
		self.profondeur = profondeur
		
	def executer(self, espace):
		if self.type in classes:
			elem = document.createElement("declaration")
			val = document.createElement("valeur")

			res = self.noeudExpression.executer(espace)
			if isTuple(res) :
				val.appendChild(res[1])
				res = res[0]
			else : 
				val.appendChild(document.createTextNode(str(res)))

			elem.appendChild(val)
			elem.setAttribute("nom" , self.nom )
			elem.setAttribute("type" , self.type )
			variables[espace].ajouter( self.nom , res , self.profondeur)
			return elem
			
			
class NoeudAffectation(NoeudVariable):
	def __init__(self, nom, noeudExpression):
		NoeudVariable.__init__(self, nom, noeudExpression)
		
	def executer(self, espace):
		elem = document.createElement("affectation")
		elem.setAttribute("nom" , self.nom.objet)

		res = self.noeudExpression.executer(espace)
		
		if isTuple(res):
			elem.appendChild(res[1])
			res = res[0]
		else :
			elem.appendChild(document.createTextNode(str(res)))

		elem.setAttribute("valeur" , str(res))
		variables[espace].modifier(self.nom.objet, res)
		return variables[espace].getVariable(self.nom.objet), elem
			
#Noeud permettant l'execution d'un bloc si la condition est vrai
		
class NoeudConditionnel(Noeud):
	def __init__(self, condition, bloc):
		self.condition = condition
		self.bloc = bloc
		
	def executer(self, espace):
		elem = document.createElement("condition")
		res = self.condition.executer(espace)

		if isTuple(res):
			elem.appendChild(res[1])
			res = res[0]
		else : 
			elem.appendChild(document.createTextNode(str(res)))

		if res.val:
			resBloc = self.bloc.executer(espace)
			if isTuple(resBloc):
				elem.appendChild(resBloc[1])
				resBloc = resBloc[0]
			else:
				elem.appendChild(resBloc)
			return True , elem
		return False , elem
		
# Noeud executant une boucle fairetantque ou tantquefaire				
class NoeudTantQue(Noeud):
		def __init__(self, noeudConditionnel, faireDabord):
			self.noeudConditionnel = noeudConditionnel
			self.faireDabord = faireDabord
			
		def executer(self, espace):
			elem = document.createElement("fairetantque" if self.faireDabord  else "tantque")
			if self.faireDabord:
				while True:
					variables[espace].ajouterProfondeur()
					res = self.noeudConditionnel.executer(espace)
					if isTuple(res):
						elem.appendChild(res[1])
						res = res[0]
					else:
						elem.appendChild(res)
					if not( res ):
						break;
					variables[espace].supprimerProfondeur()
			else:
				res = True
				while res:
					res = self.noeudConditionnel.executer(espace)
					if isTuple(res):
						elem.appendChild(res[1])
						res = res[0]
					else:
						elem.appendChild(res)
			return elem
					
class PourChaqueDans(Noeud):
	def __init__(self, noeudConditionnel, variable, debut, fin):
		self.noeudConditionnel = noeudConditionnel
		self.variable = variable
		self.debut = debut
		self.fin = fin
		
	def executer(espace):
		if(fin > debut):
			raise Exception('problème interval')
		variables[profondeur].ajouter(variable, debut, variables[profondeur].getProfondeur())
		for variable.executer(espace).val in range(self.debut, self.fin-1):
			variables[espace].ajouterProfondeur()
			self.noeudConditionnel.executer(espace)
			variables[espace].supprimerProfondeur()
		variables[profondeur].supprimer(variable)
		
					
# Noeuds des opérations binaires ou unaires	
class NoeudOperation(Noeud):
	def __init__(self, appellant, operateur):
		self.appellant = appellant
		self.operateur = operateur
			
class NoeudOperationBinaire(NoeudOperation):
	def __init__(self, appellant, operateur, operande, char):
		NoeudOperation.__init__(self, appellant, operateur)
		self.operande = operande
		self.char = char
		
	def executer(self, espace):
		elem = document.createElement("operation")
		appel = self.appellant.executer(espace)
		oper = self.operande.executer(espace)

		opg = document.createElement("opg")
		opd = document.createElement("opd")
		op = document.createElement("op")

		if isTuple(appel):
			opg.appendChild(appel[1])
			appel = appel[0]
		else : 
			opg.appendChild( document.createTextNode( str(appel) ) )

		op.appendChild(document.createTextNode(self.char))
		
		if isTuple(oper):
			opd.appendChild(oper[1])
			oper = oper[0]
		else : 
			opd.appendChild( document.createTextNode( str(oper) ) )

		res = self.operateur( appel , oper )
		elem.setAttribute("res" , str(res.val))

		elem.appendChild( opg )
		elem.appendChild( op )
		elem.appendChild( opd )

		return res , elem

class NoeudOperationUnaire(NoeudOperation):
	def __init__(self, appellant, operateur, char):
		NoeudOperation.__init__(self, appellant, operateur, operande)
		self.char = char
		
	def executer(self, espace):
		elem = document.createElement("operation")
		op = document.createElement("op")
		opd = document.createElement("opd")
		res = self.operateur( self.appellant.executer(espace) )
		if isTuple(res):
			opd.appendChild(res[1])
			res = res[0]
		else:
			elem.appendChild(res)
		op.appendChild(document.createTextNode(self.char))
		return elem

# Noeud retournant un objet de type LucasNatif			
class NoeudObjet(Noeud):
	
	def __init__(self, objet):
		self.objet = objet
		
	def executer(self, espace):
		return self.objet
			
class NoeudObjetVariable(NoeudObjet):
	def __init__(self, nom):
		NoeudObjet.__init__(self, nom)
		
	def executer(self, espace):
		elem = document.createElement("variable")
		elem.setAttribute("nom" , self.objet)
		elem.setAttribute("valeur" , str(variables[espace].getVariable(self.objet).val) )
		return variables[espace].getVariable(self.objet) , elem

class NoeudAff(Noeud):
	def __init__(self, noeudExpression):
		self.noeudExpression = noeudExpression
		
	def executer(self, espace):
		res = self.noeudExpression.executer(espace)
		elem = document.createElement("sortie")
		if isTuple(res):
			elem.appendChild(res[1])
			res = res[0]
		else:
			elem.appendChild(document.createTextNode(str(res.val)))

		NoeudProgramme.resultat += str(res) + "\n"
		return elem
