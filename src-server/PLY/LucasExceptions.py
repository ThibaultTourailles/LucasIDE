# -*- coding:utf-8 -*-

class LucasException(Exception):
	
	def __init__(self, msg=""):
		self.msg = "EXCEPTION : " + msg

	def __str__(self):
		return str(self.msg)
