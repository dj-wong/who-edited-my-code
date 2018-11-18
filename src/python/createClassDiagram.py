import os
import glob

def get_parent_names(filepath):
    file = open(filepath)
    lines = file.readlines()
    file.close()

    for index, line in enumerate(lines):
        if "public class" in line or "private class" in line:
            # To account for class declarations longer than one line
            current_index_to_check = index + 1
            current_line = line

            while "{" not in current_line:
                current_line = current_line + " " + lines[current_index_to_check]
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

                    implements_classes_final.append(implements_classes[-1].strip(" {\n"))

                    return [extends_class] + implements_classes_final

            # Handling classes that only implement
            elif "implements" in current_line:
                # line example: public class DetailActivity implements Interface1, Interface2 {
                # implements_classes = ["public class DetailActivity ", " Interface1, Interface2 {"] ->
                # "Interface1, Interface2 {" -> ["Interface1", "Interface2 {"]
                implements_classes = current_line.split("implements")[1].strip().split(",")

                # Handling classes that implement more than one class
                implements_classes_final = []

                for class_name in implements_classes[:-1]:
                    implements_classes_final.append(class_name)

                implements_classes_final.append(implements_classes[-1].strip(" {\n"))

                return implements_classes_final

            # Handling classes that don't extend or implement
            else:
                return []

    # Handling files that don't have a class declaration line
    return []


java_file_paths = glob.glob("/Users/allisonhamelin/Coding/Repos/CPSC410/github-plugin/**/*.java", recursive=True)

file_objects = []

for file_path in java_file_paths:

    parent_ids = get_parent_names(file_path)

    item = {
        "id": os.path.basename(file_path),
        "parent_ids": parent_ids,
    }

    # print(item)

    file_objects.append(item)

print(file_objects)

