import glob 
import math
import numpy


def indent(txt, stops=1):
	return (" " * 4 * stops + txt)


def output(file_name):
	opened = open(file_name, "r")
	writing = open("treemap.json", "w")
	writing.write("{\n")
	writing.write(indent("\"name\": \"Kickstarter\", \n"))
	writing.write(indent("\"children\": [ \n"))
	for index, line in enumerate(opened):
		if (index > 0):
			splited = line.split(",")
			writing.write(indent("{\n", 2))
			writing.write(indent("\"name\": " + splited[0].split(":")[1] + ",\n", 2))
			writing.write(indent("\"children\": [ \n", 2))

			# successRate = float(splited[7].split(":")[1].split("}")[0]) / 100
			# totalProjects = float(splited[1].split(":")[1])
			# totalSuccess = successRate * totalProjects
			# totalUnsuccess = totalProjects - totalSuccess
			writing.write(indent("{\"name\": \"S\", ", 3))
			writing.write("\"size\": " + splited[3].split(":")[1][2:-4] + "}, \n")
			writing.write(indent("{\"name\": \"U\", ", 3))
			writing.write("\"size\": " + splited[4].split(":")[1][2:-4] + "}, \n")
			writing.write(indent("{\"name\": \"L\", ", 3))
			writing.write("\"size\": " + splited[5].split(":")[1][2:-4] + "} \n")

			writing.write(indent("]\n", 2))
			writing.write(indent("},\n "))


			# writing.write("	" + splited[1] + "\n")
			# writing.write("	" + splited[2] + "\n")
			# writing.write("	" + splited[3] + "\n")
			# writing.write("	" + splited[4] + "\n")
			# writing.write("	" + splited[7] + "\n")
	writing.write("] \n")
	writing.write("} \n")

output("overview.json")

