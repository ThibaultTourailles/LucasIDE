# -*- coding:utf-8 -*-


from LucasExceptions import LucasException


class Lanceur:

	@staticmethod
	def lanceExceptInst(nomClasse,x):
		raise LucasException("Instanciation d'un `" + nomClasse + "` impossible a partir d'un `" + str(x) + "`.")

	@staticmethod
	def lanceExceptOper(nomClasse,op,x=None):
		txt = "La methode `operateur" + op + "( "
		if x is not None :
			txt += x
		txt += " )` de la classe `" + nomClasse + "` n'est pas implementee."
		raise LucasException(txt)

	@staticmethod
	def lanceExceptCast(nomClasse,typeDest):
		txt = "La conversion d'un `" + nomClasse + "` en un `" + typeDest + "` n'est pas autorisee."
		raise LucasException(txt)



class DicOp:

	__dic = 	{

	 'Entier' 	: 	{		# type APPELANT

			 'inst' : int

			,'cast' :		{
				 'int' 		: int
				,'float'	: float
				,'str'		: str
							}

			,'Entier'	: 	{	# type compatible
			 	 '+' 		: 	( 'Entier',		int.__add__ )
				,'-'		:	( 'Entier',		int.__sub__ )
				,'*'		:	( 'Entier',		int.__mul__ )
				,'/'		:	( 'Entier',		int.__div__ )
				,'%'		:	( 'Entier',		int.__mod__ )
		 		,'=='		:	( 'Booleen',	lambda x,y : (0 == x.__cmp__(int(y))) )
				,'!='		:	( 'Booleen',	lambda x,y : (0 != x.__cmp__(int(y))) )
				,'<='		:	( 'Booleen',	lambda x,y : (0 >= x.__cmp__(int(y))) )
				,'<' 		:	( 'Booleen',	lambda x,y : (0 >  x.__cmp__(int(y))) )
				,'>='		:	( 'Booleen',	lambda x,y : (0 <= x.__cmp__(int(y))) )
				,'>' 		:	( 'Booleen',	lambda x,y : (0 <  x.__cmp__(int(y))) )
							}
			 ,'Flottant': 	{
			 	 '+' 		: 	( 'Entier',		int.__add__ )
				,'-'		:	( 'Entier',		int.__sub__ )
				,'*'		:	( 'Entier',		int.__mul__ )
				,'/'		:	( 'Entier',		int.__div__ )
				,'%'		:	( 'Entier',		int.__mod__ )
		 		,'=='		:	( 'Booleen',	lambda x,y : (0 == x.__cmp__(int(y))) )
				,'!='		:	( 'Booleen',	lambda x,y : (0 != x.__cmp__(int(y))) )
				,'<='		:	( 'Booleen',	lambda x,y : (0 >= x.__cmp__(int(y))) )
				,'<' 		:	( 'Booleen',	lambda x,y : (0 >  x.__cmp__(int(y))) )
				,'>='		:	( 'Booleen',	lambda x,y : (0 <= x.__cmp__(int(y))) )
				,'>' 		:	( 'Booleen',	lambda x,y : (0 <  x.__cmp__(int(y))) )
			 				}
			 	}	# Fin type Entier
			 
	,'Flottant' : 	{

			 'inst' : float

			,'cast' :		{
				 'int' 		: int
				,'float'	: float
				,'str'		: str
							}

			,'Entier'	: 	{
				 '+'		:	( 'Flottant',	float.__add__ )
				,'-'		:	( 'Flottant',	float.__sub__ )
				,'*'		:	( 'Flottant',	float.__mul__ )
				,'/'		:	( 'Flottant',	float.__div__ )
				,'%'		:	( 'Flottant',	float.__mod__ )
				,'=='		:	( 'Booleen',	float.__eq__ )
				,'!='		:	( 'Booleen',	float.__ne__ )
				,'<='		:	( 'Booleen',	float.__le__ )
				,'<' 		:	( 'Booleen',	float.__lt__ )
				,'>='		:	( 'Booleen',	float.__ge__ )
				,'>' 		:	( 'Booleen',	float.__gt__ )
							}
			 ,'Flottant': 	{
				 '+'		:	( 'Flottant',	float.__add__ )
				,'-'		:	( 'Flottant',	float.__sub__ )
				,'*'		:	( 'Flottant',	float.__mul__ )
				,'/'		:	( 'Flottant',	float.__div__ )
				,'%'		:	( 'Flottant',	float.__mod__ )
				,'=='		:	( 'Booleen',	float.__eq__ )
				,'!='		:	( 'Booleen',	float.__ne__ )
				,'<='		:	( 'Booleen',	float.__le__ )
				,'<' 		:	( 'Booleen',	float.__lt__ )
				,'>='		:	( 'Booleen',	float.__ge__ )
				,'>' 		:	( 'Booleen',	float.__gt__ )
							}
				}	# Fin type Flottant

	,'Booleen' : 	{

			 'inst' : int

			,'cast' :		{
				 'str'		: lambda x : 'VRAI' if x else 'FAUX'
				,'bool'		: bool
				,'int'		: int
							}

			,'Booleen'	: 	{ 
				 '=='		:	( 'Booleen', int.__eq__ )
				,'!='		:	( 'Booleen', int.__ne__ )
				,'ET'		:	( 'Booleen', lambda x,y : 1 if x&y else 0 )
				,'OU'		:	( 'Booleen', lambda x,y : 1 if x|y else 0 )
				,'NON'		:	( 'Booleen', lambda x : not x )
							}
		}	# Fin type BOOLEEN
	,'Car'		:	{

			 'inst'	:	str

			,'cast'	:		{
				'str'		: str
							}

			,'Car'	:		{
				 '=='		:	( 'Booleen', str.__eq__ )
				,'!='		:	( 'Booleen', str.__ne__ )
				,'<='		:	( 'Booleen', str.__le__ )
				,'<'		:	( 'Booleen', str.__lt__ )
				,'>='		:	( 'Booleen', str.__ge__ )
				,'>'		:	( 'Booleen', str.__gt__ )
							}

			,'Entier' :		{
				 '+'		:	( 'Car', lambda x,n : (chr(ord(x) + int(n))) )
				,'-'		:	( 'Car', lambda x,n : (chr(ord(x) - int(n))) )
							}
		}	# Fin type Car

	,'Chc'		:	{
			 'inst'	:	str

			,'cast'	:		{
				'str'		: str
							}

			,'Chc'	:		{
				 '+'		:	( 'Chc',	 str.__add__ )
				,'=='		:	( 'Booleen', str.__eq__ )
				,'!='		:	( 'Booleen', str.__ne__ )
				,'<='		:	( 'Booleen', str.__le__ )
				,'<'		:	( 'Booleen', str.__lt__ )
				,'>='		:	( 'Booleen', str.__ge__ )
				,'>'		:	( 'Booleen', str.__gt__ )
							}
			,'Car'	:		{
				 '+'		:	( 'Chc',	 str.__add__ )
				,'=='		:	( 'Booleen', str.__eq__ )
				,'!='		:	( 'Booleen', str.__ne__ )
				,'<='		:	( 'Booleen', str.__le__ )
				,'<'		:	( 'Booleen', str.__lt__ )
				,'>='		:	( 'Booleen', str.__ge__ )
				,'>'		:	( 'Booleen', str.__gt__ )
							}

		}	# Fin type Chc

	 }	# Fin DICTIONNAIRE


	@staticmethod
	def getOperInstance(nomClasse):
		return DicOp.__dic[nomClasse]['inst']
		
	@staticmethod
	def getOperCast(nomClasse, typePy, typeLucas):
		if typePy in DicOp.__dic[nomClasse]['cast']:
			return DicOp.__dic[nomClasse]['cast'][typePy]
		Lanceur.lanceExceptCast(nomClasse, typeLucas)
		
	@staticmethod
	def getOperMath(nomClasse, typeOperande, operateur):
		if typeOperande in DicOp.__dic[nomClasse]:
			if operateur in DicOp.__dic[nomClasse][typeOperande]:
				return DicOp.__dic[nomClasse][typeOperande][operateur]
		Lanceur.lanceExceptOper(nomClasse, operateur, typeOperande)

	@staticmethod
	def getOperUnaire(nomClasse, operateur):
		if operateur in DicOp.__dic[nomClasse][nomClasse]:
			return DicOp.__dic[nomClasse][nomClasse][operateur]
		else:
			Lanceur.lanceExceptOper(nomClasse, operateur)


class Natif :
# MÉTHODES COMMUNES AUX TYPES NATIFS LUCAS :

	@staticmethod
	def opBinArith(appelant, operande, operateur):
		tp, op = DicOp.getOperMath(appelant.typeObj, operande.typeObj, operateur)
		castParam = DicOp.getOperInstance(appelant.typeObj)
		val = op(appelant.val, castParam(operande))
		return eval(tp + "(" + str(val) + ")" )

	@staticmethod
	def opBinLog(appelant, operande, operateur):
		tp, op = DicOp.getOperMath(appelant.typeObj, operande.typeObj, operateur)
		castParam = DicOp.getOperInstance(appelant.typeObj)
		val = op(appelant.val, castParam(operande))
		return eval(tp + "(" + str(val) + ")" )

	@staticmethod
	def opNon(appelant,operateur):
		tp, op = DicOp.getOperUnaire(appelant.typeObj, operateur)
		val = op(appelant.val)
		return eval(tp + "(" + str(val) + ")" )

	@staticmethod
	def opCast(appelant, operateur, typeLucas):
		op = DicOp.getOperCast(appelant.typeObj, operateur, typeLucas)
		return op( appelant.val )

	def __add__(self,x):	return self.__class__.opBinArith(self, x, '+')
	def __sub__(self,x):	return self.__class__.opBinArith(self, x, '-')
	def __mul__(self,x):	return self.__class__.opBinArith(self, x, '*')
	def __div__(self,x):	return self.__class__.opBinArith(self, x, '/')
	def __mod__(self,x):	return self.__class__.opBinArith(self, x, '%')
	
	def __eq__(self,x):		return self.__class__.opBinLog(self, x, '==')
	def __ne__(self,x):		return self.__class__.opBinLog(self, x, '!=')
	def __le__(self,x):		return self.__class__.opBinLog(self, x, '<=')
	def __lt__(self,x):		return self.__class__.opBinLog(self, x, '<')
	def __ge__(self,x):		return self.__class__.opBinLog(self, x, '>=')
	def __gt__(self,x):		return self.__class__.opBinLog(self, x, '>')

	def __not__(self):		return self.__class__.opNon(self, 'NON')

	def __and__(self,x):	return self.__class__.opBinLog(self, x, 'ET')
	def __or__(self,x):		return self.__class__.opBinLog(self, x, 'OU')

	def __str__(self):		return self.__class__.opCast(self, 'str', 'Chc')
	def __int__(self):		return self.__class__.opCast(self, 'int', 'Entier')
	def __float__(self):	return self.__class__.opCast(self, 'float', 'Flottant')
	def __bool__(self):		return self.__class__.opCast(self, 'bool', 'Booleen')
	
class Entier(Natif):

	typeObj = 'Entier'
	
	def __init__(self,x):
		if type(x) in (int,float):
			self.val = int(x)
		elif isinstance(x,Entier) or isinstance(x,Flottant):
			self.val = int(x.val)
		else:
			Lanceur.lanceExceptInst(Entier.typeObj,x)

	def __trunc__(self):
		return self.val


class Flottant(Natif):

	typeObj = 'Flottant'

	def __init__(self,x):
		if type(x) in (float, int):
			self.val = float(x)
		elif isinstance(x,Flottant) or isinstance(x,Entier):
			self.val = float(x.val)
		else:
			Lanceur.lanceExceptInst(Flottant.typeObj,x)

class Booleen(Natif):

	typeObj = 'Booleen'

	def __init__(self,x):
		if type(x) is int:
			self.val = int(x)
		elif type(x) is bool:
			self.val = 1 if x else 0
		elif isinstance(x,Booleen):
			self.val = int(x.val)
		else: 
			Lanceur.lanceExceptInst(Booleen.typeObj,x)

class Car(Natif):

	typeObj = 'Car'

	def __init__(self,x):
		if type(x) is str and len(x) == 1:
			self.val = str(x)
		elif isinstance(x,Car):
			self.val = str(x.val)
		elif isinstance(x,Chc) and len(x.val) == 1:
		 	self.val = str(x.val)
		else:
			Lanceur.lanceExceptInst(Car.typeObj,x)

	@staticmethod
	def opBinArith(appelant, operande, operateur):
		tp, op = DicOp.getOperMath(appelant.typeObj, operande.typeObj, operateur)
		castParam = DicOp.getOperInstance(appelant.typeObj)
		val = op(appelant.val, castParam(operande))
		return eval(tp + "('" + str(val) + "')" )

class Chc(Natif):

	typeObj = 'Chc'

	def __init__(self,x):
		if type(x) is str:
			self.val = str(x)
		elif isinstance(x,Chc) or isinstance(x,Car):
			self.val = str(x.val)
		else:
			Lanceur.lanceExceptInst(Chc.typeObj,x)

	@staticmethod
	def opBinArith(appelant, operande, operateur):
		tp, op = DicOp.getOperMath(appelant.typeObj, operande.typeObj, operateur)
		castParam = DicOp.getOperInstance(appelant.typeObj)
		val = op(appelant.val, castParam(operande))
		return eval(tp + '("' + str(val) + '")' )

