# main templates
for file in about contact_success demo_success privacy terms; do
  if [ -f app/templates/main/$file.html ]; then
    echo "FOUND:    app/templates/main/$file.html"
  else
    echo "MISSING:  app/templates/main/$file.html"
  fi
done

# platform templates
for file in overview synapse_ai features specs; do
  if [ -f app/templates/platform/$file.html ]; then
    echo "FOUND:    app/templates/platform/$file.html"
  else
    echo "MISSING:  app/templates/platform/$file.html"
  fi
done

# solutions templates
for file in overview energy construction public_safety defense; do
  if [ -f app/templates/solutions/$file.html ]; then
    echo "FOUND:    app/templates/solutions/$file.html"
  else
    echo "MISSING:  app/templates/solutions/$file.html"
  fi
done

# static images
for file in og-image.jpg twitter-card.jpg; do
  if [ -f app/static/images/$file ]; then
    echo "FOUND:    app/static/images/$file"
  else
    echo "MISSING:  app/static/images/$file"
  fi
done

