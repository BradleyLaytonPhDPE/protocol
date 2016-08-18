import {Reflection, ReflectionKind, ITraverseCallback, TraverseProperty} from "./abstract";
import {ReflectionGroup} from "../ReflectionGroup";
import {DeclarationReflection} from "./declaration";


export class ContainerReflection extends Reflection
{
    /**
     * The children of this reflection.
     */
    children:DeclarationReflection[];

    /**
     * All children grouped by their kind.
     */
    groups:ReflectionGroup[];



    /**
     * Return a list of all children of a certain kind.
     *
     * @param kind  The desired kind of children.
     * @returns     An array containing all children with the desired kind.
     */
    getChildrenByKind(kind:ReflectionKind):DeclarationReflection[] {
        var values:DeclarationReflection[] = [];
        for (var key in this.children) {
            var child = this.children[key];
            if (child.kindOf(kind)) {
                values.push(child);
            }
        }
        return values;
    }


    /**
     * Traverse all potential child reflections of this reflection.
     *
     * The given callback will be invoked for all children, signatures and type parameters
     * attached to this reflection.
     *
     * @param callback  The callback function that should be applied for each child reflection.
     */
    traverse(callback:ITraverseCallback) {
        if (this.children) {
            this.children.forEach((child:DeclarationReflection) => {
                callback(child, TraverseProperty.Children);
            });
        }
    }


    /**
     * Return a raw object representation of this reflection.
     */
    toObject():any {
        var result = super.toObject();

        if (this.groups) {
            var groups:any[] = [];
            this.groups.forEach((group) => {
                groups.push(group.toObject())
            });

            result['groups'] = groups;
        }

        if (this.sources) {
          var sources:any[] = [];
          this.sources.forEach((source) => {
              sources.push({
                fileName: source.fileName,
                line: source.line
              });
          });

          result['sources'] = sources;
        }

        return result;
    }
}
