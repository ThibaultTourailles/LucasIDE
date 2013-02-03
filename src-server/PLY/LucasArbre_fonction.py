# -*- coding:utf-8 -*-

from LucasNatifs import *
from LucasPoolVariable_fonction import *

from xml.dom.minidom import getDOMImplementation
impl = getDOMImplementation()
document = impl.createDocument(None, "some_tag", None)

classes = {'Entier' : Entier, 'Flottant' : Flottant, 'Car' : Car, 'Chc' : Chc, 'Booleen' : Booleen }

variables = dict()

fonctions = dict()

def testObjetRetour(objet):
	return isinstance(objet, Retour)

# Racine
class NoeudProgramme:
	nom = None
	resultat = ""
	domRes = None

	def __init__(self, nom, blocSimple):
		NoeudProgramme.nom = nom
		self.blocSimple = blocSimple

	def executer(self):
		NoeudProgramme.domRes = document.createElement("sorties")
		variables[self.nom] = PoolVariables()
		self.blocSimple.executer(NoeudProgramme.nom)
		NoeudProgramme.resultat = NoeudProgramme.domRes.toxml()
		return NoeudProgramme.resultat

#Noeuds fonctions
class NoeudDeclarationFonction:
	def __init__(self, protoFonction, arbre):
		self.prototype = protoFonction
	 	self.arbre = arbre
		self.nom = self.prototype.nom
		self.nombreDeCopies = 0
		fonctions[self.prototype.nom] = self

	def copier(self):
		self.nombreDeCopies += 1
		return NoeudAttrape(self.arbre.copier(), self.prototype.classeNative)
		# return NoeudAppelFonction(self.prototype.nom,self.prototype.lstNoeudParam)

class ParametrePrototype:
	def __init__(self, classeNative, parVal, nomVar):
		self.classeNative = classeNative
		self.parVal = parVal
		self.nom = nomVar

class PrototypeFonction:
	def __init__(self, nomProto, lstNoeudParam, classeNative ="Vide"):
		self.nom = nomProto
		self.lstNoeudParam = lstNoeudParam
		self.classeNative = classeNative

class NoeudAppelFonction:
	def __init__(self, nomFonction, lstParam):
		self.nom = nomFonction
		self.lstParam = lstParam

	def copier(self):
		return NoeudAppelFonction( self.nom , self.lstParam ) 

	def executer(self, espace):
		self.declFct = fonctions[self.nom]
		self.arbre = self.declFct.copier()
		self.espace = str(self.declFct.nom) + "_" + str(self.declFct.nombreDeCopies)
		
		variables[self.espace] = PoolVariables()
		nbParamAttendu = len(fonctions[self.nom].prototype.lstNoeudParam)
		nbParamDonne = len(self.lstParam)

		if nbParamDonne != nbParamAttendu:
			raise Exception("%s Paramètres attendu, %s donnés" % (nbParamAttendu, nbParamDonne) )

		for i in xrange( 0, nbParamDonne ):
			paramProto = self.declFct.prototype.lstNoeudParam[i]
			paramReel = self.lstParam[i]
			if not paramProto.classeNative == paramReel.executer(espace).typeObj:
				raise Exception("Type de param incompatible.")
			if paramProto.parVal:
				val = classes[paramReel.executer(espace).typeObj]( paramReel.executer(espace) )
				variables[self.espace].ajouter( paramProto.nom, val, variables[self.espace].getProfondeur() )
			else:
				variables[self.espace].ajouter( paramProto.nom, paramReel.executer(espace), variables[espace].getProfondeur() )
		return self.arbre.executer(self.espace)

#Noeud Blocs
class NoeudAttrape:
	def __init__(self, noeudBlocSimple, typeAttendu="Vide"):
		self.typeAttendu = typeAttendu
		self.noeudBlocSimple = noeudBlocSimple

	def copier(self):
		return NoeudAttrape( self.typeAttendu , self.noeudBlocSimple.copier() )

	def executer(self, espace):
		res = self.noeudBlocSimple.executer(espace)
		if testObjetRetour( res ): 
			if res.resultat.typeObj != self.typeAttendu:
				raise Exception("Type de retour non valide : %s attendu, %s donné" % ( self.typeAttendu, res.resultat.typeObj ) )
		return res.executer(espace)

class NoeudBlocSimple:
	def __init__(self, listeNoeudExpression):
		self.listeNoeudExpression = listeNoeudExpression

	def copier(self):
		return NoeudBlocSimple( [i.copier() for i in self.listeNoeudExpression] )

	def executer(self, espace):
		for i in self.listeNoeudExpression:
			res = i.executer(espace)
			if testObjetRetour( res ): return res

#Noeud Si
class NoeudSi:
	def __init__(self, listeConditionInstruction):
		self.listeConditionInstruction = listeConditionInstruction

	def copier(self):
		return NoeudSi( [i.copier() for i in self.listeConditionInstruction] )
		
	def executer(self, espace):
		variables[espace].ajouterProfondeur()
		fini = False
		i = 0
		res = None
		while i < len(self.listeConditionInstruction) and not fini:
			fini = self.listeConditionInstruction[i].condition.executer(espace).__bool__()
			if fini:
				res = self.listeConditionInstruction[i].instruction.executer(espace)
			i += 1
		variables[espace].supprimerProfondeur()
		if testObjetRetour( res ): return res

# Noeud executant une boucle fairetantque ou tantquefaire				
class NoeudTantQueFaire:
		def __init__(self, conditionInstruction ):
			self.conditionInstruction = conditionInstruction

		def copier(self):
			return NoeudTantQueFaire( self.conditionInstruction.copier() )
			
		def executer(self, espace):
			while self.conditionInstruction.condition.executer(espace).__bool__():
				res = self.conditionInstruction.instruction.executer(espace)
				if testObjetRetour( res ) : return res

class NoeudFaireTantQue:
		def __init__(self, conditionInstruction ):
			self.conditionInstruction = conditionInstruction

		def copier(self):
			return NoeudTantQueFaire( self.conditionInstruction.copier() )
			
		def executer(self, espace):
			while True:
				res = self.conditionInstruction.instruction.executer(espace)
				if testObjetRetour( res ): return res
				if not self.conditionInstruction.condition.executer(espace).__bool__(): break

class NoeudInstruction:
	def __init__(self, noeudExpression):
		self.noeudExpression = noeudExpression

	def copier(self):
		return NoeudInstruction( self.noeudExpression.copier() )

	def executer(self, espace):
		res = self.noeudExpression.executer(espace)
		if testObjetRetour( res ): return res

class ConditionInstruction:
	def __init__(self, condition, instruction, nature='PasSinon'):
		self.condition = condition
		self.instruction = instruction
		self.nature = nature
	
	def copier(self):
		return ConditionInstruction( self.condition.copier(), self.instruction.copier() )

#class PourChaqueDans(Noeud):
#	def __init__(self, noeudConditionnel, variable, debut, fin):
#		self.noeudConditionnel = noeudConditionnel
#		self.variable = variable
#		self.debut = debut
#		self.fin = fin
#
#	def copier(self):
#		return PourChaqueDans( noeudConditionnel.copier(), str(variable), int(debut), int(fin) )
#		
#	def executer(espace):
#		if(fin > debut):
#			raise Exception('problème interval')
#		variables[espace].ajouter(variable, debut, variables[espace].getProfondeur())
#		for variable.executer(espace).val in range(self.debut, self.fin-1):
#			variables[espace].ajouterProfondeur()
#			self.noeudConditionnel.executer(espace)
#			variables[espace].supprimerProfondeur()
#		variables[profondeur].supprimer(variable)

class NoeudDeclarationVariable:
	def __init__(self, classeNative, nom, noeudExpression, profondeur):
		self.classeNative = classeNative
		self.nom = nom
		self.noeudExpression = noeudExpression
		self.profondeur = profondeur

	def copier(self):
		return NoeudDeclaration( self.classeNative, self.nom, self.noeudExpression.copier(), self.profondeur)
		
	def executer(self, espace):
		variables[espace].ajouter(self.nom, self.noeudExpression.executer(espace), self.profondeur)

class NoeudRetourner:
	def __init__(self, noeudExpression):
		self.noeudExpression = noeudExpression

	def copier(self):
		return NoeudRetourner( self.noeudExpression.copier() )

	def executer(self,espace):
		return Retour( self.noeudExpression.executer(espace) )

class Retour:
	def __init__(self, resultat):
		self.resultat = resultat

	def executer(self, espace):
		return self.resultat

class NoeudOperationBinaire:
	def __init__(self, appellant, operateur, operande):
		self.appellant = appellant
		self.operateur = operateur
		self.operande = operande
		
	def copier(self):
		return NoeudOperationBinaire( self.appellant.copier() , self.operateur , self.operande.copier() )

	def executer(self, espace):
		return self.operateur( self.appellant.executer(espace), self.operande.executer(espace) )

class NoeudOperationUnaire:
	def __init__(self, appellant, operateur):
		self.appellant = appellant
		self.operateur = operateur
	
	def copier(self):
		return NoeudOperationUnaire( self.appellant.copier(), self.operateur )
	
	def executer(self, espace):
		return self.operateur( self.appellant )

# Noeud retournant un objet de type LucasNatif			
class NoeudObjet:
	def __init__(self, objet):
		self.objet = objet
		
	def copier(self):
		return NoeudObjet(classes[self.objet.typeObj](self.objet))

	def executer(self, espace):
		return self.objet
			
class NoeudObjetVariable:
	def __init__(self, nom):
		self.nom = nom

	def copier(self):
		return NoeudObjetVariable( self.nom )

	def executer(self, espace):
		return variables[espace].getVariable(self.nom)

class NoeudAffectation(NoeudObjetVariable):
	def __init__(self, nom, noeudExpression):
		NoeudObjetVariable.__init__(self, nom)
		self.noeudExpression = noeudExpression
		
	def copier(self):
		return NoeudAffectation( self.nom, self.noeudExpression.copier() )

	def executer(self, espace):
		variables[espace].modifier(self.nom.nom, self.noeudExpression.executer(espace))
		return variables[espace].getVariable(self.nom.nom)

class NoeudAff:
	def __init__(self, noeudExpression):
		self.noeudExpression = noeudExpression
	
	def copier(self):
		return NoeudAff( self.noeudExpression.copier() )

	def executer(self, espace):
		sortieElem = document.createElement("sortie")
		sortieElem.appendChild(document.createTextNode(str(self.noeudExpression.executer(espace))))
		NoeudProgramme.domRes.appendChild(sortieElem)
