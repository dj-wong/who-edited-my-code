import os
import glob
import re
import argparse
import json
from emailUserDictionary import EmailUserDictionary

def get_function_from_line(line):
    if line is not None:
        function_in_line = re.search("(public|private|static|protected)\s*(.*)\s*\(.*", line)
        if function_in_line is not None:
            # get last element in list of words, which is function name
            return function_in_line.group(2).split()[-1]
        else:
            return None
    else:
        return None

def get_class_functions(filepath):
    file = open(filepath)
    lines = file.readlines()
    file.close()

    functions_dict = []

    for index, line in enumerate(lines):
        retrieved_function = get_function_from_line(line)
        if retrieved_function is not None:
            functions_dict.append({
                "line": index + 1,
                "functionName": retrieved_function
            })

    return functions_dict

def get_parent_names(filepath):
    file = open(filepath)
    lines = file.readlines()
    file.close()

    for index, line in enumerate(lines):
        is_class = re.search("(public|private).*class", line) is not None
        if is_class:
            # To account for class declarations longer than one line
            current_index_to_check = index + 1
            current_line = line

            while "{" not in current_line:
                current_line = current_line + " " + \
                    lines[current_index_to_check]
                current_index_to_check = current_index_to_check + 1

            # Now that we have the whole class declaration line...
            if "extends" in current_line:
                parent_classes = current_line.split("extends")[1]

                # Handling classes that only extend
                if "implements" not in current_line:
                    return [parent_classes.strip(" {\n")]

                # Handling classes that both extend and implement
                else:
                    parent_classes = parent_classes.split("implements")

                    extends_class = parent_classes[0].strip()

                    implements_classes = parent_classes[1].split(",")

                    # Handling classes that implement more than one class
                    implements_classes_final = []

                    for class_name in implements_classes[:-1]:
                        implements_classes_final.append(class_name)

                    implements_classes_final.append(
                        implements_classes[-1].strip(" {\n"))

                    return [extends_class] + implements_classes_final

            # Handling classes that only implement
            elif "implements" in current_line:
                # line example: public class DetailActivity implements Interface1, Interface2 {
                # implements_classes = ["public class DetailActivity ", " Interface1, Interface2 {"] ->
                # "Interface1, Interface2 {" -> ["Interface1", "Interface2 {"]
                implements_classes = current_line.split(
                    "implements")[1].strip().split(",")

                # Handling classes that implement more than one class
                implements_classes_final = []

                for class_name in implements_classes[:-1]:
                    implements_classes_final.append(class_name)

                implements_classes_final.append(
                    implements_classes[-1].strip(" {\n"))

                return implements_classes_final

            # Handling classes that don't extend or implement
            else:
                return []

    # Handling files that don't have a class declaration line
    return []


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('-p', '--path', required=True)

    io_args = parser.parse_args()
    path = io_args.path

    if path != "":

        java_file_paths = glob.glob(
            path + "/src/main/**/*.java", recursive=True)

        if not java_file_paths:
            print("Found no java files, exiting")
            exit(-1)

        class_data = dict()

        emailUserDict = EmailUserDictionary()
        emailUserDict.generate_email_user_dictionary(path)

        text_file = open("src/web/data/class_graph.txt", "w")
        text_file.truncate()

        text_file.write("digraph {\n")

        for file_path in java_file_paths:
            try:
                parent_ids = get_parent_names(file_path)
                class_name = os.path.basename(file_path)
                class_name = class_name.replace(".java", "")
                functions_in_class = get_class_functions(file_path)

                for parent in parent_ids:
                    parent_fix = re.sub("<.*>", "", parent)
                    parent_fix = re.sub("[^\w\s]", "", parent_fix)
                    text_file.write("\t%s -> %s;\n" % (class_name, parent_fix))

                abs_path = os.path.abspath(file_path)
                file_committers = emailUserDict.get_committers_for_file(abs_path)
                if not file_committers:
                    file_committers = []

                file_details = {
                    "name": class_name,
                    "committers": file_committers,
                    "functions": functions_in_class,
                    "filepath": re.sub(path, "", file_path)
                }

                class_data[class_name] = file_details

            except:
                pass
        text_file.write("}")
        text_file.close()

        with open('src/web/data/class_data.json', 'w') as fp:
            json.dump(class_data, fp, sort_keys=True, indent=2)
    
    else:
        print("Empty String as path passed in, exiting...")  
