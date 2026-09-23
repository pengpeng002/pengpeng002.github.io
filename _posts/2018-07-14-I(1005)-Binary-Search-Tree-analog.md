---
title: "I(1005): Binary Search Tree analog"
date: 2018-07-14 13:29:23
description: "Binary Search Tree, abbreviated as BST, is a kind of binary tree maintains the following property"
tags: [CSU, 树]
category: "18暑假集训"
---

# I(1005): Binary Search Tree analog

### I\( [1005](http://acm.csu.edu.cn/csuoj/problemset/problem?pid=1005) \): Binary Search Tree analog

[](http://acm.csu.edu.cn/csuoj/problemset/summary?pid=1005) [](http://acm.csu.edu.cn/csuoj/problemset/summary?pid=1005) Time Limit:1 SecMemory Limit:128 MbSubmitted:102Solved:57---

### Description

Binary Search Tree, abbreviated as BST, is a kind of binary tree maintains the following property:

1. each node has a Key value, which can be used to compare with each other\.

2. For every node in the tree, every Key value in its left subtree is smaller than its own Key value\.

3. For every node in the tree, every Key value in its right subtree is equal to or larger than its own Key value\.

Now we need to analog a BST, we only require one kind of operation: inserting\.

First, we have an empty BST\. Input is a sequence of numbers\. We need to insert them one by one flowing the rules below:

If the inserted value is smaller than the root's value, insert it to the left subtree\.

If the inserted value is larger than or equal to the value of the root's value, insert it to the right subtree\.

After each input, we need to output the preorder, inorder, postorder traversal sequences\.

About tree traversal, the following is from Wikipedia:

> ##### Depth\-first Traversal
> 
> To traverse a non\-empty binary tree in preorder, perform the following operations recursively at each node, starting with the root node:
> 
> - Visit the root\.
> 
> - Traverse the left subtree\.
> 
> - Traverse the right subtree\.
> 
> To traverse a non\-empty binary tree in inorder \(symmetric\), perform the following operations recursively at each node:
> 
> - Traverse the left subtree\.
> 
> - Visit the root\.
> 
> - Traverse the right subtree\.
> 
> To traverse a non\-empty binary tree in postorder, perform the following operations recursively at each node:
> 
> - Traverse the left subtree\.
> 
> - Traverse the right subtree\.
> 
> - Visit the root\.
> 
> 

Look at the folowing example:

Intput is a sequence of 5 integers: 3 6 9 5 1

After each integer inserted the structure of the tree is illustrated in the flowing:

```
   3
 /   \
1      6
     /  \
    5     9
```


### Input

The first integer of the input is `T` , the number of test cases\.Each test case has two lines\.The first line contain an integer `N` ,\(1<= `N` <=1000\), the number of numbers need to be inserted into the BST\.The second line contain `N` integers separated by space, each integer is in the range of \[0,2<sup>30</sup>\]\.


### Output

Each test case, output must contain three lines: the preorder, inorder and postorder traversal sequence\. The numbers in each line should be separated by a single space and you should not output anything at the end of the line\! Output a blank line after each case\.


### Sample Input

```
1
5
3 6 9 5 1
```


### Sample Output

```
3 1 6 5 9
1 3 5 6 9
1 5 9 6 3
```



赤裸裸的数据结构题啊。尽管万般不愿，但不建立树我实在是做不出来，没办法了。

题意：给你一串数字，请建立一颗平衡二叉树并求出先中后序遍历的结果。

什么是平衡二叉树什么是先序遍历就自行百度吧


```cpp
#include<iostream>
#include<cstdlib>
using namespace std;
struct point
{
	int value;
	point * leftchild;
	point * rightchild;
};
int b=0;
point* insert(point* tree, int value)//插入节点，左子树的值永远小于根节点，右子树永远大于
{
	if (tree == NULL)
	{
		tree = (point*) malloc (sizeof(point));
		tree->value = value;
		tree->leftchild = tree->rightchild = NULL;
	}
	else if (value >= tree->value)
	{
		tree->rightchild = insert (tree->rightchild, value);
	}
	else
	{
		tree->leftchild = insert (tree->leftchild, value);
	}
	return tree;
}
void first(point * tree)//先序遍历，先访问根，再访问左子树，最后右子树
{
	if (tree == NULL) return;
	if(b)printf(" ");
	{
		printf("%d",tree->value);
		b++;
	}
	first(tree->leftchild);//访问左子树，递归
	first(tree->rightchild);//访问右子树，递归
}
void second(point *tree)//中序遍历，先左子树，然后根，最后右子树
{
	if(tree == NULL)return;
	second(tree->leftchild);
	if (b)printf(" ");
	{
		printf("%d",tree->value);
		b++;
	}
	second(tree->rightchild);
}
void third(point * tree)//后序，先左 后右 最后根
{
	if(tree == NULL)return;
	third(tree->leftchild);
	third(tree->rightchild);
	if(b)printf(" ");
	{
		printf("%d",tree->value);
		b++;
	}
}
int main()
{
	int T;
	cin >> T;
	while (T--)
	{
		int n;
		cin >> n;
		point * tree = NULL;
		for (int i = 0; i < n; i++)//建立二叉树
		{
			int value;
			cin >> value;
			tree = insert(tree, value);
		}
		b=0;first(tree);cout << endl;//先序遍历
		b=0;second(tree);cout << endl;//中序
		b=0;third(tree);cout << endl;//后序
		cout << endl;
	}
	return 0;
}
```