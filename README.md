# Rally Room

A collection of Tennis, Beach Tennis, Pickleball and Padel drills, games and strategies.

---

Site available at: https://luiswollenschneider.github.io/RallyRoom/

## Workflow

```bash
# 1. Create a new entry
node new-entry.js "My Drill Name"

# 2. Edit the generated file in content/
#    Write the description, adjust diagram YAML

# 3. Open the "Court Editor" located in editor/index.html to create the court diagram, and export the YAML.
#    Paste the generated YAML into the content-file's frontmatter

# 4. Rebuild
node build.js

# 5. Commit & push
git add content/
git commit -m "add: My Drill Name"
git push
```
