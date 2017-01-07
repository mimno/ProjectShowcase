import glob 
import math
import numpy


def indent(txt, stops=1):
	return (" " * 4 * stops + txt)


def output(file_name):
	opened = open(file_name, "r")
	writing = open("sunburst.json", "w")
	writing.write("{\n")
	writing.write(indent("\"name\": \"Kickstarter\", \n"))
	writing.write(indent("\"children\": [ \n"))
	for index, line in enumerate(opened):
		if (index > 0):
			splited = line.split(",")
			writing.write(indent("{\n", 2))
			writing.write(indent("\"name\": " + splited[0].split(":")[1] + ",\n", 2))
			writing.write(indent("\"children\": [ \n", 2))
			# writing.write("  { \n")
			# writing.write("    \"name\": " + splited[7].split(":")[0] + ",\n")
			# writing.write("    \"children:\" [ \n")
			successRate = float(splited[7].split(":")[1].split("}")[0]) / 100
			totalProjects = float(splited[1].split(":")[1])
			totalSuccess = successRate * totalProjects
			totalUnsuccess = totalProjects - totalSuccess
			successRatio = round(successRate*100,1)
			unsuccessRatio = 100. - successRatio
			writing.write(indent("{\"name\": \"Successful\", ", 3))
			writing.write("\"size\": " + str(round(totalSuccess)) + ", \"ratio\": " + str(successRatio) + "},\n")
			writing.write(indent("{\"name\": \"Unsuccessful\", ", 3))
			writing.write("\"size\": " + str(round(totalUnsuccess)) + ", \"ratio\": " + str(unsuccessRatio) + "}\n")
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

